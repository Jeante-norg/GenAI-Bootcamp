const EmissionRecord = require("../Models/AI.model.js");
const CarbonCalculator = require("../utils/carbonCalculator.js");

const exportUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { format = "json", startDate, endDate } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const query = { userId };
    if (startDate || endDate) {
      query.createdAt = dateFilter;
    }

    // Get user emissions data
    const records = await EmissionRecord.find(query).sort({ createdAt: -1 });

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data available for export",
      });
    }

    // Calculate summary statistics
    const totalCarbon = records.reduce(
      (sum, record) => sum + (record.analysis.total_emission || 0),
      0
    );

    const categoryBreakdown = records.reduce((acc, record) => {
      const category = record.analysis.category || "unknown";
      const emission = record.analysis.total_emission || 0;
      acc[category] = (acc[category] || 0) + emission;
      return acc;
    }, {});

    const monthlyBreakdown = records.reduce((acc, record) => {
      const date = new Date(record.createdAt);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;
      const emission = record.analysis.total_emission || 0;
      acc[monthYear] = (acc[monthYear] || 0) + emission;
      return acc;
    }, {});

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        timeRange: {
          startDate: startDate || "all",
          endDate: endDate || "all",
        },
        totalRecords: records.length,
        exportType: "raw_data",
      },
      summary: {
        totalCarbon: Math.round(totalCarbon * 100) / 100,
        averagePerRecord:
          records.length > 0
            ? Math.round((totalCarbon / records.length) * 100) / 100
            : 0,
        categoryBreakdown: Object.entries(categoryBreakdown).map(
          ([category, total]) => ({
            category,
            total: Math.round(total * 100) / 100,
            percentage:
              totalCarbon > 0 ? Math.round((total / totalCarbon) * 100) : 0,
          })
        ),
        monthlyBreakdown: Object.entries(monthlyBreakdown)
          .map(([month, total]) => ({
            month,
            total: Math.round(total * 100) / 100,
          }))
          .sort((a, b) => {
            // Sort by date
            const [aMonth, aYear] = a.month.split(" ");
            const [bMonth, bYear] = b.month.split(" ");
            return (
              new Date(`${aMonth} 1, ${aYear}`) -
              new Date(`${bMonth} 1, ${bYear}`)
            );
          }),
      },
      records: records.map((record) => ({
        id: record._id,
        createdAt: record.createdAt,
        date: new Date(record.createdAt).toLocaleDateString("en-US"),
        category: record.analysis.category || "Unknown",
        quantity: record.analysis.quantity || 0,
        unit: record.analysis.unit || "units",
        carbonEmission: record.analysis.total_emission || 0,
        source: record.analysis.source_text || "",
        fileType: record.fileType,
        advice: record.analysis.advice || [],
        manualEntry: record.analysis.manual_entry || false,
      })),
    };

    // Format response based on requested format
    if (format === "csv") {
      return exportAsCSV(exportData, res);
    } else {
      // Default JSON response
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="carbonkind-data-${
          new Date().toISOString().split("T")[0]
        }.json"`
      );
      res.status(200).json(exportData);
    }
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportAsCSV = (exportData, res) => {
  try {
    let csvContent = "";

    // Main Data Section
    csvContent += "CARBONKIND EXPORT - RAW DATA\n";
    csvContent += `Exported on: ${new Date().toLocaleDateString()}\n`;
    csvContent += `Total Records: ${exportData.metadata.totalRecords}\n`;
    csvContent += `Time Range: ${exportData.metadata.timeRange.startDate} to ${exportData.metadata.timeRange.endDate}\n\n`;

    // Records Table
    csvContent += "DETAILED RECORDS\n";
    csvContent +=
      "Date,Category,Quantity,Unit,Carbon Emission (kg CO₂e),Source,Type,File Type\n";

    exportData.records.forEach((record) => {
      const row = [
        `"${record.date}"`,
        `"${record.category}"`,
        record.quantity,
        `"${record.unit}"`,
        record.carbonEmission,
        `"${(record.source || "").replace(/"/g, '""')}"`,
        record.manualEntry ? "Manual Entry" : "Document Upload",
        `"${record.fileType}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Summary Section
    csvContent += "\n\nSUMMARY\n";
    csvContent += `Total Carbon Emission,${exportData.summary.totalCarbon} kg CO₂e\n`;
    csvContent += `Average Per Record,${exportData.summary.averagePerRecord} kg CO₂e\n`;
    csvContent += `Total Records,${exportData.metadata.totalRecords}\n`;

    // Category Breakdown
    csvContent += "\nCATEGORY BREAKDOWN\n";
    csvContent += "Category,Total Emission (kg CO₂e),Percentage\n";
    exportData.summary.categoryBreakdown.forEach((item) => {
      csvContent += `"${item.category}",${item.total},${item.percentage}%\n`;
    });

    // Monthly Breakdown
    csvContent += "\nMONTHLY BREAKDOWN\n";
    csvContent += "Month,Total Emission (kg CO₂e)\n";
    exportData.summary.monthlyBreakdown.forEach((item) => {
      csvContent += `"${item.month}",${item.total}\n`;
    });

    // Tips Section
    csvContent += "\n\nDATA INTERPRETATION TIPS\n";
    csvContent += "Tip,Description\n";
    csvContent +=
      '"Focus Areas","Categories with highest percentages are your biggest opportunities for reduction"\n';
    csvContent +=
      '"Trend Analysis","Compare monthly totals to identify patterns and progress"\n';
    csvContent +=
      '"Carbon Equivalents","1,000 kg CO₂e = 1 metric ton. The average person emits 4-5 tons annually"\n';

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="carbonkind-export-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.status(200).send("\uFEFF" + csvContent); // BOM for Excel compatibility
  } catch (error) {
    throw new Error(`CSV export failed: ${error.message}`);
  }
};

const generateSustainabilityReport = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { format = "json" } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const records = await EmissionRecord.find({ userId }).sort({
      createdAt: -1,
    });

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data available for report generation",
      });
    }

    // Calculate comprehensive statistics
    const totalCarbon = records.reduce(
      (sum, record) => sum + (record.analysis.total_emission || 0),
      0
    );

    const categoryBreakdown = records.reduce((acc, record) => {
      const category = record.analysis.category || "unknown";
      const emission = record.analysis.total_emission || 0;
      acc[category] = (acc[category] || 0) + emission;
      return acc;
    }, {});

    const monthlyTrends = records.reduce((acc, record) => {
      const monthYear = new Date(record.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      const emission = record.analysis.total_emission || 0;
      if (!acc[monthYear]) {
        acc[monthYear] = { total: 0, count: 0, records: [] };
      }
      acc[monthYear].total += emission;
      acc[monthYear].count += 1;
      acc[monthYear].records.push(record);
      return acc;
    }, {});

    // Generate insights
    const highestCategory = Object.entries(categoryBreakdown).reduce(
      (max, [category, total]) =>
        total > max.total ? { category, total } : max,
      { category: "", total: 0 }
    );

    const averageMonthly =
      Object.values(monthlyTrends).reduce(
        (sum, month) => sum + month.total,
        0
      ) / Object.keys(monthlyTrends).length;

    // Calculate carbon intensity score (1-10, lower is better)
    const carbonIntensity = Math.min(
      10,
      Math.max(1, Math.round(totalCarbon / records.length / 10))
    );

    const sustainabilityReport = {
      reportId: `CR-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      period: {
        start: records[records.length - 1].createdAt,
        end: records[0].createdAt,
        days: Math.ceil(
          (new Date(records[0].createdAt) -
            new Date(records[records.length - 1].createdAt)) /
            (1000 * 60 * 60 * 24)
        ),
      },
      executiveSummary: {
        totalCarbonFootprint: Math.round(totalCarbon * 100) / 100,
        averageDailyEmission:
          Math.round(
            (totalCarbon / (Object.keys(monthlyTrends).length * 30)) * 100
          ) / 100,
        carbonIntensity: Math.round((totalCarbon / records.length) * 100) / 100,
        carbonIntensityScore: carbonIntensity,
        dataQuality:
          records.length >= 10
            ? "High"
            : records.length >= 5
            ? "Medium"
            : "Low",
        overallRating:
          carbonIntensity <= 3
            ? "Excellent"
            : carbonIntensity <= 6
            ? "Good"
            : "Needs Improvement",
      },
      keyFindings: {
        primarySource: highestCategory.category,
        primaryContribution: Math.round(
          (highestCategory.total / totalCarbon) * 100
        ),
        monthlyAverage: Math.round(averageMonthly * 100) / 100,
        trend:
          Object.keys(monthlyTrends).length >= 2
            ? "Analyzing"
            : "Insufficient data",
        comparison: `Your footprint is ${
          carbonIntensity <= 5 ? "below" : "above"
        } average for similar users`,
      },
      recommendations: [
        `Focus on reducing ${highestCategory.category} emissions (${Math.round(
          (highestCategory.total / totalCarbon) * 100
        )}% of total)`,
        "Consider implementing energy-efficient practices",
        "Explore carbon offset options for unavoidable emissions",
        `Track more consistently to ${
          records.length < 10 ? "improve data quality" : "identify trends"
        }`,
      ],
      detailedAnalysis: {
        categoryBreakdown: Object.entries(categoryBreakdown).map(
          ([category, total]) => ({
            category,
            total: Math.round(total * 100) / 100,
            percentage: Math.round((total / totalCarbon) * 100),
            impact:
              total > totalCarbon * 0.3
                ? "High"
                : total > totalCarbon * 0.15
                ? "Medium"
                : "Low",
            suggestion: getCategorySuggestion(category),
          })
        ),
        monthlyTrends: Object.entries(monthlyTrends)
          .map(([month, data]) => ({
            month,
            total: Math.round(data.total * 100) / 100,
            average: Math.round((data.total / data.count) * 100) / 100,
            records: data.count,
            trend:
              data.total > averageMonthly ? "Above Average" : "Below Average",
          }))
          .sort((a, b) => new Date(a.month) - new Date(b.month)),
      },
      actionPlan: {
        immediateActions: [
          `Review ${highestCategory.category} consumption patterns`,
          "Set a 10% reduction target for next month",
          "Document all major emission sources",
        ],
        mediumTermGoals: [
          "Implement at least 2 efficiency improvements",
          "Establish baseline for future comparisons",
          "Explore renewable energy options",
        ],
        longTermVision: [
          "Achieve carbon neutrality in key areas",
          "Develop comprehensive sustainability strategy",
          "Become a sustainability leader in your community",
        ],
      },
      methodology: {
        calculationStandard: "CarbonKind Enhanced Calculator",
        emissionFactors: "Based on IPCC and EPA standards",
        dataSources: "User-provided documents and manual entries",
        reportVersion: "1.0",
        lastUpdated: new Date().toISOString(),
      },
    };

    // Format response based on requested format
    if (format === "csv") {
      return exportSustainabilityReportAsCSV(sustainabilityReport, res);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sustainability-report-${sustainabilityReport.reportId}.json"`
      );
      res.status(200).json(sustainabilityReport);
    }
  } catch (error) {
    console.error("Report Generation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportSustainabilityReportAsCSV = (report, res) => {
  try {
    let csvContent = "";

    // Header Section
    csvContent += "CARBONKIND SUSTAINABILITY REPORT\n";
    csvContent += `Report ID: ${report.reportId}\n`;
    csvContent += `Generated: ${new Date(
      report.generatedAt
    ).toLocaleDateString()}\n`;
    csvContent += `Period: ${new Date(
      report.period.start
    ).toLocaleDateString()} to ${new Date(
      report.period.end
    ).toLocaleDateString()}\n\n`;

    // Executive Summary
    csvContent += "EXECUTIVE SUMMARY\n";
    csvContent += "Metric,Value,Rating\n";
    csvContent += `Total Carbon Footprint,${report.executiveSummary.totalCarbonFootprint} kg CO₂e,\n`;
    csvContent += `Average Daily Emission,${report.executiveSummary.averageDailyEmission} kg CO₂e,\n`;
    csvContent += `Carbon Intensity,${report.executiveSummary.carbonIntensity} kg/record,\n`;
    csvContent += `Carbon Intensity Score,${report.executiveSummary.carbonIntensityScore}/10,${report.executiveSummary.overallRating}\n`;
    csvContent += `Data Quality,${report.executiveSummary.dataQuality},\n\n`;

    // Key Findings
    csvContent += "KEY FINDINGS\n";
    csvContent += "Finding,Details\n";
    csvContent += `Primary Emission Source,${report.keyFindings.primarySource}\n`;
    csvContent += `Contribution,${report.keyFindings.primaryContribution}%\n`;
    csvContent += `Monthly Average,${report.keyFindings.monthlyAverage} kg CO₂e\n`;
    csvContent += `Trend Analysis,${report.keyFindings.trend}\n`;
    csvContent += `Comparison,${report.keyFindings.comparison}\n\n`;

    // Recommendations
    csvContent += "TOP RECOMMENDATIONS\n";
    csvContent += "Priority,Recommendation\n";
    report.recommendations.forEach((rec, index) => {
      csvContent += `"${index === 0 ? "High" : "Medium"}","${rec}"\n`;
    });
    csvContent += `\n`;

    // Category Breakdown
    csvContent += "CATEGORY BREAKDOWN\n";
    csvContent +=
      "Category,Total (kg CO₂e),Percentage,Impact Level,Suggestion\n";
    report.detailedAnalysis.categoryBreakdown.forEach((item) => {
      csvContent += `"${item.category}",${item.total},${item.percentage}%,${item.impact},"${item.suggestion}"\n`;
    });
    csvContent += `\n`;

    // Monthly Trends
    csvContent += "MONTHLY TRENDS\n";
    csvContent += "Month,Total (kg CO₂e),Average Per Record,Records,Trend\n";
    report.detailedAnalysis.monthlyTrends.forEach((item) => {
      csvContent += `"${item.month}",${item.total},${item.average},${item.records},${item.trend}\n`;
    });
    csvContent += `\n`;

    // Action Plan
    csvContent += "ACTION PLAN\n";
    csvContent += "Timeline,Action Item\n";
    report.actionPlan.immediateActions.forEach((action) => {
      csvContent += `"Immediate (0-30 days)","${action}"\n`;
    });
    report.actionPlan.mediumTermGoals.forEach((action) => {
      csvContent += `"Medium Term (1-6 months)","${action}"\n`;
    });
    report.actionPlan.longTermVision.forEach((action) => {
      csvContent += `"Long Term (6+ months)","${action}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sustainability-report-${report.reportId}.csv"`
    );
    res.status(200).send("\uFEFF" + csvContent); // BOM for Excel compatibility
  } catch (error) {
    throw new Error(
      `Sustainability report CSV export failed: ${error.message}`
    );
  }
};

// Helper function for category-specific suggestions
const getCategorySuggestion = (category) => {
  const suggestions = {
    electricity: "Switch to LED bulbs and use smart power strips",
    transportation: "Consider public transit or carpooling 2 days/week",
    food: "Incorporate 1-2 plant-based meals per week",
    home: "Improve insulation and use programmable thermostat",
    waste: "Increase recycling and composting efforts",
  };
  return (
    suggestions[category] ||
    "Review consumption patterns and identify reduction opportunities"
  );
};

module.exports = { exportUserData, generateSustainabilityReport };
