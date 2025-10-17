import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";

function DetailedReport() {
  const [emissionsData, setEmissionsData] = useState([]);
  const [summary, setSummary] = useState({
    totalCarbon: 0,
    monthlyCarbon: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  // Fetch user emissions data
  const fetchUserEmissions = async () => {
    try {
      setLoading(true);
      const result = await carbonAPI.getUserEmissions();

      if (result.success) {
        setEmissionsData(result.records || []);
        setSummary(
          result.summary || {
            totalCarbon: 0,
            monthlyCarbon: 0,
            totalRecords: 0,
          }
        );
      } else {
        console.error("Failed to fetch emissions:", result.message);
      }
    } catch (error) {
      console.error("Error fetching emissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected category and time range
  const getFilteredData = () => {
    let filtered = [...emissionsData];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (record) => record.analysis.category === selectedCategory
      );
    }

    // Filter by time range
    if (timeRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (timeRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }

      filtered = filtered.filter(
        (record) => new Date(record.createdAt) >= filterDate
      );
    }

    return filtered;
  };

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const breakdown = {};

    emissionsData.forEach((record) => {
      const category = record.analysis.category || "unknown";
      const emission = record.analysis.total_emission || 0;

      breakdown[category] = (breakdown[category] || 0) + emission;
    });

    return Object.entries(breakdown)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        percentage:
          summary.totalCarbon > 0
            ? Math.round((total / summary.totalCarbon) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const monthlyData = {};

    emissionsData.forEach((record) => {
      const date = new Date(record.createdAt);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const emission = record.analysis.total_emission || 0;

      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + emission;
    });

    return Object.entries(monthlyData)
      .map(([month, total]) => ({
        month,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserEmissions();
  }, []);

  const filteredData = getFilteredData();
  const categoryBreakdown = getCategoryBreakdown();
  const monthlyTrends = getMonthlyTrends();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading detailed report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Detailed Carbon Report
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of your carbon footprint and reduction
            opportunities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-2">
              {summary.totalCarbon} kg
            </div>
            <div className="text-gray-600">Total CO₂e</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-2">
              {summary.monthlyCarbon} kg
            </div>
            <div className="text-gray-600">This Month</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-2">
              {summary.totalRecords}
            </div>
            <div className="text-gray-600">Documents Analyzed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="electricity">Electricity</option>
                <option value="transportation">Transportation</option>
                <option value="food">Food</option>
                <option value="home">Home Energy</option>
                <option value="waste">Waste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="3months">Past 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Category Breakdown */}
          <div className="space-y-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {categoryBreakdown.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: [
                            "#10B981",
                            "#059669",
                            "#047857",
                            "#065F46",
                            "#064E3B",
                          ][index % 5],
                        }}
                      ></div>
                      <span className="capitalize">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {item.total} kg
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Monthly Trends
              </h2>
              <div className="space-y-3">
                {monthlyTrends.map((trend) => (
                  <div
                    key={trend.month}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600">
                      {new Date(trend.month + "-01").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span className="font-semibold text-green-700">
                      {trend.total} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activities */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Recent Activities ({filteredData.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No records found for the selected filters
                </p>
              ) : (
                filteredData.map((record) => (
                  <div
                    key={record._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 capitalize">
                          {record.analysis.category || "Unknown"}
                        </span>
                        <span className="text-green-700 font-bold ml-2">
                          {record.analysis.total_emission} kg CO₂e
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {record.analysis.source_text ||
                        "No description available"}
                    </p>
                    {record.analysis.advice &&
                      record.analysis.advice.length > 0 && (
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-green-800 text-sm font-medium">
                            💡 {record.analysis.advice[0]}
                          </p>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Print Report
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailedReport;
