import React, { useState } from "react";

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportType, setExportType] = useState("data");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      let queryParams = `format=${exportFormat}`;

      // Add date range if specified
      if (dateRange === "custom" && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (dateRange !== "all") {
        const endDate = new Date();
        const startDate = new Date();

        switch (dateRange) {
          case "week":
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case "3months":
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          default:
            break;
        }

        if (dateRange !== "all") {
          queryParams += `&startDate=${
            startDate.toISOString().split("T")[0]
          }&endDate=${endDate.toISOString().split("T")[0]}`;
        }
      }

      const endpoint =
        exportType === "report" ? "sustainability-report" : "export";
      const url = `http://localhost:8000/export/${endpoint}?${queryParams}`;

      // Create a hidden anchor tag to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = true;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onExport({
        success: true,
        format: exportFormat,
        type: exportType,
        dateRange,
      });

      onClose();
    } catch (error) {
      console.error("Export error:", error);
      onExport({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileName = () => {
    const baseName =
      exportType === "report" ? "sustainability-report" : "carbon-data";
    const date = new Date().toISOString().split("T")[0];
    const extension = exportFormat === "csv" ? "csv" : "json";
    return `${baseName}-${date}.${extension}`;
  };

  const getFileDescription = () => {
    if (exportType === "report") {
      return exportFormat === "csv"
        ? "Comprehensive sustainability analysis with scores, recommendations, and action plans in Excel-friendly format"
        : "Detailed JSON report with carbon metrics, trends, and personalized recommendations for developers";
    } else {
      return exportFormat === "csv"
        ? "Raw data export with organized sections, summaries, and Excel-ready formatting"
        : "Complete dataset in JSON format for developers, APIs, and custom analysis";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Export Data</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Export Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportType("data")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    exportType === "data"
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-lg mb-1">📊</span>
                  Raw Data
                  <div className="text-xs mt-1 text-gray-500">
                    Complete dataset
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setExportType("report")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    exportType === "report"
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-lg mb-1">📈</span>
                  Analysis Report
                  <div className="text-xs mt-1 text-gray-500">
                    Insights & recommendations
                  </div>
                </button>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat("json")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    exportFormat === "json"
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-lg mb-1">{} </span>
                  JSON
                  <div className="text-xs mt-1 text-gray-500">
                    For developers & APIs
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    exportFormat === "csv"
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-lg mb-1">📋</span>
                  CSV/Excel
                  <div className="text-xs mt-1 text-gray-500">
                    For spreadsheets
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="3months">Past 3 Months</option>
                <option value="year">Past Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* File Preview */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Export Preview
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex justify-between">
                  <span>File:</span>
                  <strong className="text-blue-900">{getFileName()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <strong className="text-blue-900">
                    {exportType === "report"
                      ? "Sustainability Report"
                      : "Raw Data"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <strong className="text-blue-900">
                    {exportFormat === "csv" ? "CSV (Excel-ready)" : "JSON"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <strong className="text-blue-900">
                    {dateRange === "custom" && customStartDate && customEndDate
                      ? `${customStartDate} to ${customEndDate}`
                      : dateRange === "all"
                      ? "All Time"
                      : `Past ${dateRange}`}
                  </strong>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    {getFileDescription()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={
                  loading ||
                  (dateRange === "custom" &&
                    (!customStartDate || !customEndDate))
                }
                className={`flex-1 ${
                  loading ||
                  (dateRange === "custom" &&
                    (!customStartDate || !customEndDate))
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 rounded-md transition`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Exporting...
                  </span>
                ) : (
                  "Download Export"
                )}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              📥 Export Features
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>
                • <strong>Raw Data:</strong> Complete dataset with all records
                and summaries
              </li>
              <li>
                • <strong>Analysis Report:</strong> Sustainability scores,
                recommendations, and action plans
              </li>
              <li>
                • <strong>CSV Format:</strong> Excel-ready with organized
                sections and formatting
              </li>
              <li>
                • <strong>JSON Format:</strong> Developer-friendly for APIs and
                custom analysis
              </li>
              <li>
                • <strong>Date Filtering:</strong> Export specific time periods
                for focused analysis
              </li>
            </ul>
          </div>

          {/* Excel Tips */}
          {exportFormat === "csv" && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                💡 Excel Tips
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• File opens directly in Excel with proper formatting</li>
                <li>
                  • Use <strong>Filter & Sort</strong> to analyze data by
                  category or date
                </li>
                <li>
                  • Create <strong>Pivot Tables</strong> for advanced analysis
                </li>
                <li>
                  • Use <strong>Charts</strong> to visualize trends and patterns
                </li>
                <li>
                  • Save as <strong>.xlsx</strong> for better Excel
                  compatibility
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
