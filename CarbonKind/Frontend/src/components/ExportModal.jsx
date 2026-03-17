import React, { useState } from "react";

const API_BASE = "https://genai-bootcamp-hgp2.onrender.com";

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

      if (dateRange === "custom" && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (dateRange !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        if (dateRange === "week") startDate.setDate(endDate.getDate() - 7);
        else if (dateRange === "month")
          startDate.setMonth(endDate.getMonth() - 1);
        else if (dateRange === "3months")
          startDate.setMonth(endDate.getMonth() - 3);
        else if (dateRange === "year")
          startDate.setFullYear(endDate.getFullYear() - 1);
        queryParams += `&startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`;
      }

      const endpoint =
        exportType === "report" ? "sustainability-report" : "export";
      const url = `${API_BASE}/export/${endpoint}?${queryParams}`;

      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Export failed");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      onExport({
        success: true,
        format: exportFormat,
        type: exportType,
        dateRange,
      });
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      onExport({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getFileName = () => {
    const base =
      exportType === "report" ? "sustainability-report" : "carbon-data";
    const date = new Date().toISOString().split("T")[0];
    return `${base}-${date}.${exportFormat === "csv" ? "csv" : "json"}`;
  };

  const getFileDescription = () => {
    if (exportType === "report") {
      return exportFormat === "csv"
        ? "Comprehensive sustainability analysis with RAG-generated scores, recommendations, and action plans (Excel-ready)"
        : "Detailed JSON report with carbon metrics, trends, and AI-personalized recommendations";
    }
    return exportFormat === "csv"
      ? "Raw data export with organized sections, summaries, and Excel-ready formatting"
      : "Complete dataset in JSON format for developers, APIs, and custom analysis";
  };

  if (!isOpen) return null;

  const canExport =
    !loading &&
    !(dateRange === "custom" && (!customStartDate || !customEndDate));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Export Data</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
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
                {[
                  {
                    key: "data",
                    icon: "📊",
                    label: "Raw Data",
                    sub: "Complete dataset",
                  },
                  {
                    key: "report",
                    icon: "📈",
                    label: "Analysis Report",
                    sub: "Insights & recommendations",
                  },
                ].map(({ key, icon, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExportType(key)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exportType === key
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block text-lg mb-1">{icon}</span>
                    {label}
                    <div className="text-xs mt-1 text-gray-500">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    key: "json",
                    icon: "{}",
                    label: "JSON",
                    sub: "For developers & APIs",
                  },
                  {
                    key: "csv",
                    icon: "📋",
                    label: "CSV / Excel",
                    sub: "For spreadsheets",
                  },
                ].map(({ key, icon, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExportFormat(key)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exportFormat === key
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block text-lg mb-1">{icon}</span>
                    {label}
                    <div className="text-xs mt-1 text-gray-500">{sub}</div>
                  </button>
                ))}
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

            {/* Preview */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Export Preview
              </h3>
              <div className="text-sm text-blue-700 space-y-1.5">
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

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!canExport}
                className={`flex-1 ${
                  !canExport
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 rounded-md transition`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Exporting…
                  </span>
                ) : (
                  "Download Export"
                )}
              </button>
            </div>
          </div>

          {/* Help */}
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
                • <strong>Analysis Report:</strong> Sustainability scores, AI
                recommendations, and action plans
              </li>
              <li>
                • <strong>CSV:</strong> Excel-ready with organized sections
              </li>
              <li>
                • <strong>JSON:</strong> Developer-friendly for APIs
              </li>
              <li>
                • <strong>Date Filtering:</strong> Export specific time periods
              </li>
            </ul>
          </div>

          {exportFormat === "csv" && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                💡 Excel Tips
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Opens directly in Excel with proper formatting</li>
                <li>• Use Filter & Sort to analyze by category or date</li>
                <li>• Create Pivot Tables for advanced analysis</li>
                <li>• Save as .xlsx for better Excel compatibility</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
