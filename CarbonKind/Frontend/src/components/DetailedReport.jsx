import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";

const categoryEmoji = {
  electricity: "⚡",
  transportation: "🚗",
  food: "🍽️",
  home: "🏠",
  waste: "♻️",
  unknown: "📄",
};

const categoryColors = ["#10B981", "#059669", "#047857", "#065F46", "#064E3B"];

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
  const [expandedRecord, setExpandedRecord] = useState(null);

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
          },
        );
      }
    } catch (error) {
      console.error("Error fetching emissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    let filtered = [...emissionsData];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (r) => r.analysis.category === selectedCategory,
      );
    }

    if (timeRange !== "all") {
      const filterDate = new Date();
      if (timeRange === "week") filterDate.setDate(filterDate.getDate() - 7);
      else if (timeRange === "month")
        filterDate.setMonth(filterDate.getMonth() - 1);
      else if (timeRange === "3months")
        filterDate.setMonth(filterDate.getMonth() - 3);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= filterDate);
    }

    return filtered;
  };

  const getCategoryBreakdown = () => {
    const breakdown = {};
    emissionsData.forEach((r) => {
      const cat = r.analysis.category || "unknown";
      breakdown[cat] = (breakdown[cat] || 0) + (r.analysis.total_emission || 0);
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

  const getMonthlyTrends = () => {
    const monthlyData = {};
    emissionsData.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] =
        (monthlyData[key] || 0) + (r.analysis.total_emission || 0);
    });
    return Object.entries(monthlyData)
      .map(([month, total]) => ({
        month,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  };

  // Collect all unique advice tips across all records
  const getAllAdvice = () => {
    const seen = new Set();
    const tips = [];
    emissionsData.forEach((r) => {
      const advice = Array.isArray(r.analysis.advice) ? r.analysis.advice : [];
      advice.forEach((tip) => {
        if (!seen.has(tip)) {
          seen.add(tip);
          tips.push({ tip, category: r.analysis.category });
        }
      });
    });
    return tips.slice(0, 6);
  };

  const getEquivalentTotals = () => {
    let trees = 0;
    let miles = 0;
    let phones = 0;
    emissionsData.forEach((r) => {
      const eq = r.analysis.equivalents;
      if (eq) {
        trees += eq.trees_needed || 0;
        miles += eq.car_miles || 0;
        phones += eq.smartphones_charged || 0;
      }
    });
    return { trees, miles, phones };
  };

  useEffect(() => {
    fetchUserEmissions();
  }, []);

  const filteredData = getFilteredData();
  const categoryBreakdown = getCategoryBreakdown();
  const monthlyTrends = getMonthlyTrends();
  const allAdvice = getAllAdvice();
  const equivalentTotals = getEquivalentTotals();
  const maxMonthly = Math.max(...monthlyTrends.map((t) => t.total), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading detailed report…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-green-800">
              Detailed Carbon Report
            </h1>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              🧠 RAG Enhanced
            </span>
          </div>
          <p className="text-gray-600">
            Comprehensive analysis powered by contextual AI knowledge retrieval
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {summary.totalCarbon} kg
            </div>
            <div className="text-gray-600">Total CO₂e</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {summary.monthlyCarbon} kg
            </div>
            <div className="text-gray-600">This Month</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {summary.totalRecords}
            </div>
            <div className="text-gray-600">Records Analyzed</div>
          </div>
        </div>

        {/* Equivalents Banner */}
        {equivalentTotals.trees > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
              🧠 Your Total Footprint Is Equivalent To…
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-1">🌳</div>
                <div className="text-xl font-bold text-indigo-700">
                  {equivalentTotals.trees.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  trees absorbing CO₂ for 1 year
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-1">🚗</div>
                <div className="text-xl font-bold text-indigo-700">
                  {equivalentTotals.miles.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">miles driven</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-1">📱</div>
                <div className="text-xl font-bold text-indigo-700">
                  {equivalentTotals.phones.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">smartphones charged</div>
              </div>
            </div>
          </div>
        )}

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
          {/* Left Column */}
          <div className="space-y-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {categoryBreakdown.map((item, index) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {categoryEmoji[item.category] || "📄"}
                        </span>
                        <span className="capitalize text-sm font-medium text-gray-700">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800 text-sm">
                          {item.total} kg
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: categoryColors[index % 5],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends with mini bar chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Monthly Trends
              </h2>
              <div className="space-y-3">
                {monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-20 shrink-0">
                      {new Date(trend.month + "-01").toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      )}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            (trend.total / maxMonthly) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold text-green-700 text-sm w-16 text-right shrink-0">
                      {trend.total} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RAG-generated advice panel */}
            {allAdvice.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-green-800">
                    AI Recommendations
                  </h2>
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    🧠 RAG
                  </span>
                </div>
                <ul className="space-y-3">
                  {allAdvice.map(({ tip, category }, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">
                        {categoryEmoji[category] || "💡"}
                      </span>
                      <div>
                        <p className="text-sm text-gray-700">{tip}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                          {category}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Records */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Recent Activities ({filteredData.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No records for the selected filters
                </p>
              ) : (
                filteredData.map((record) => {
                  const cat = record.analysis.category || "unknown";
                  const isExpanded = expandedRecord === record._id;
                  const advice = Array.isArray(record.analysis.advice)
                    ? record.analysis.advice
                    : [];
                  const eq = record.analysis.equivalents;

                  return (
                    <div
                      key={record._id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Record header — always visible */}
                      <button
                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setExpandedRecord(isExpanded ? null : record._id)
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <span className="text-lg shrink-0 mt-0.5">
                              {categoryEmoji[cat] || "📄"}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-800 capitalize">
                                  {cat}
                                </span>
                                <span className="text-green-700 font-bold">
                                  {record.analysis.total_emission} kg CO₂e
                                </span>
                                {record.analysis.calculated_with && (
                                  <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                                    AI
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                                {record.analysis.source_text ||
                                  "No description"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs text-gray-400">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                          {/* Quantity */}
                          {record.analysis.quantity && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Quantity:</span>{" "}
                              {record.analysis.quantity} {record.analysis.unit}
                            </p>
                          )}

                          {/* Equivalents */}
                          {eq &&
                            (eq.trees_needed > 0 ||
                              eq.car_miles > 0 ||
                              eq.smartphones_charged > 0) && (
                              <div>
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">
                                  Equivalents
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {eq.trees_needed > 0 && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      🌳 {eq.trees_needed} trees / yr
                                    </span>
                                  )}
                                  {eq.car_miles > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      🚗 {eq.car_miles?.toLocaleString()} mi
                                    </span>
                                  )}
                                  {eq.smartphones_charged > 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                      📱{" "}
                                      {eq.smartphones_charged?.toLocaleString()}{" "}
                                      phones
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Advice */}
                          {advice.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">
                                💡 Recommendations
                              </p>
                              <ul className="space-y-1">
                                {advice.map((tip, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-gray-700 flex items-start gap-1.5"
                                  >
                                    <span className="shrink-0 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
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
