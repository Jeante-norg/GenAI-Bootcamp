import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import ManualEntryModal from "./ManualEntryModal.jsx";
import EditEntryModal from "./EditEntryModal.jsx";
import ExportModal from "./ExportModal.jsx";
import RAGInsightCard from "./RAGInsightCard.jsx";

const CATEGORY_EMOJI = {
  electricity: "⚡",
  transportation: "🚗",
  food: "🍽️",
  home: "🏠",
  waste: "♻️",
};

function LandingPage() {
  const [uploading, setUploading] = useState(false);
  const [emissionsData, setEmissionsData] = useState([]);
  const [summary, setSummary] = useState({
    totalCarbon: 0,
    monthlyCarbon: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showEditEntry, setShowEditEntry] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [lastUploadResult, setLastUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();

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
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("401")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
      "text/csv",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a PDF, JPG, PNG, or text file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10 MB");
      return;
    }

    setUploading(true);
    setLastUploadResult(null);
    setUploadError(null);

    try {
      const result = await carbonAPI.uploadDocument(file);
      if (result.success) {
        setLastUploadResult(result);
        await fetchUserEmissions();
        const input = document.getElementById("fileUpload");
        if (input) input.value = "";
      } else {
        setUploadError(result.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      setUploadError(error.message || "Upload error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getLatestSuggestions = () => {
    if (emissionsData.length === 0) {
      return {
        highImpact: "Start uploading documents to get insights",
        aiSuggestion: "Upload your first bill or receipt to begin tracking",
        extraAdvice: [],
      };
    }
    const latest = emissionsData[0].analysis;
    const advice = Array.isArray(latest.advice) ? latest.advice : [];
    return {
      highImpact: latest.category
        ? `${latest.category.charAt(0).toUpperCase() + latest.category.slice(1)} contributes significantly to your emissions`
        : "Analyzing your emission patterns",
      aiSuggestion:
        advice.length > 0
          ? advice[0]
          : "Continue tracking to get personalized recommendations",
      extraAdvice: advice.slice(1),
    };
  };

  const handleManualEntrySuccess = () => fetchUserEmissions();
  const handleEditEntrySuccess = () => fetchUserEmissions();
  const handleExportComplete = (result) => {
    if (!result.success) setUploadError(`Export failed: ${result.error}`);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowEditEntry(true);
  };
  const handleCloseEdit = () => {
    setShowEditEntry(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await carbonAPI.deleteEmissionRecord(record._id);
      if (res.success) {
        await fetchUserEmissions();
      } else {
        setUploadError("Failed to delete: " + res.message);
      }
    } catch (err) {
      setUploadError("Error deleting record: " + err.message);
    }
  };

  useEffect(() => {
    fetchUserEmissions();
  }, []);

  const suggestions = getLatestSuggestions();

  // Category breakdown for mini bars
  const categoryBreakdown = React.useMemo(() => {
    const map = {};
    emissionsData.forEach((r) => {
      const cat = r.analysis.category || "unknown";
      map[cat] = (map[cat] || 0) + (r.analysis.total_emission || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([cat, val]) => ({ cat, pct: Math.round((val / total) * 100) }));
  }, [emissionsData]);

  // Latest record equivalents
  const latestEquivalents =
    emissionsData.length > 0
      ? emissionsData[0].analysis.equivalents || null
      : null;

  return (
    <div className="bg-gray-50 min-h-screen w-full flex justify-center">
      <div className="w-full max-w-7xl p-5 text-gray-800">
        <main>
          <h1 className="text-3xl font-semibold text-green-800 mb-8">
            Dashboard
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* ── Left column ── */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Card header */}
                <div className="flex justify-between items-center text-green-800 font-semibold text-lg mb-4">
                  <span>Uploads</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="text-green-600 hover:underline font-medium"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => navigate("/report")}
                      className="text-green-600 hover:underline font-medium"
                    >
                      Insights
                    </button>
                    <a
                      href="/settings"
                      className="text-gray-600 hover:underline"
                    >
                      Settings
                    </a>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed ${
                    uploading ? "border-green-400" : "border-green-500"
                  } bg-green-50 rounded-lg text-center py-10 px-6 mb-4 transition-colors duration-200`}
                >
                  <p className="text-gray-600 mb-1">
                    Upload your bills or activity logs
                  </p>
                  <p className="text-xs text-indigo-500 font-medium mb-3">
                    🧠 RAG-enhanced AI for more accurate analysis
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".pdf,.jpg,.png,.jpeg,.txt,.csv"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="fileUpload"
                      className={`inline-block ${
                        uploading
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-700 cursor-pointer"
                      } text-white font-semibold px-5 py-2 rounded-lg transition duration-200`}
                    >
                      {uploading ? "Analyzing…" : "Choose File"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualEntry(true)}
                      className="bg-white text-green-700 border border-green-500 hover:bg-green-100 font-semibold px-5 py-2 rounded-lg transition duration-200"
                    >
                      + Manual Entry
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    {uploading
                      ? "Retrieving context and calculating emissions…"
                      : "Accepted: .pdf, .jpg, .png, .txt, .csv"}
                  </p>
                  {uploading && (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                      <p className="text-xs text-indigo-600 font-medium">
                        🧠 RAG context retrieval in progress…
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload error */}
                {uploadError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium text-sm">Upload failed</p>
                      <p className="text-sm mt-0.5">{uploadError}</p>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="text-red-400 hover:text-red-600 text-xl leading-none shrink-0"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* RAG result card */}
                {lastUploadResult && (
                  <RAGInsightCard
                    result={lastUploadResult}
                    onDismiss={() => setLastUploadResult(null)}
                  />
                )}

                {/* Recent uploads list */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-green-800">
                      Recent Uploads{loading && " (Loading…)"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {emissionsData.length} total records
                    </span>
                  </div>

                  {emissionsData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {loading
                        ? "Loading your data…"
                        : "No documents uploaded yet"}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {emissionsData.slice(0, 5).map((record, index) => {
                        const cat = record.analysis.category || "unknown";
                        const emoji = CATEGORY_EMOJI[cat] || "📄";
                        const eq = record.analysis.equivalents;
                        return (
                          <div
                            key={record._id}
                            className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-b-0"
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="text-lg mt-0.5 shrink-0">
                                {emoji}
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-700 truncate">
                                  {record.analysis.manual_entry
                                    ? "Manual Entry"
                                    : `Document ${index + 1}`}
                                  <span className="ml-2 text-sm text-green-600 capitalize">
                                    ({cat})
                                  </span>
                                  {record.analysis.calculated_with && (
                                    <span className="ml-1 text-xs text-indigo-400">
                                      · AI
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {new Date(
                                    record.createdAt,
                                  ).toLocaleDateString()}
                                  {record.analysis.source_text &&
                                    ` · ${record.analysis.source_text.substring(0, 40)}…`}
                                </div>
                                {eq && eq.trees_needed > 0 && (
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    🌳 {eq.trees_needed} trees · 🚗{" "}
                                    {eq.car_miles != null
                                      ? eq.car_miles.toLocaleString()
                                      : 0}{" "}
                                    mi
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <span className="text-green-700 font-semibold text-sm whitespace-nowrap">
                                {record.analysis.total_emission != null
                                  ? `${record.analysis.total_emission} kg`
                                  : "—"}
                              </span>
                              <button
                                onClick={() => handleEditRecord(record)}
                                title="Edit"
                                className="text-blue-400 hover:text-blue-600 text-base"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record)}
                                title="Delete"
                                className="text-red-400 hover:text-red-600 text-base"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">
              {/* Monthly footprint */}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-lg font-semibold text-green-800 mb-2">
                  This Month's Footprint
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  {loading ? "…" : `${summary.monthlyCarbon} kg CO₂e`}
                </div>
                <button
                  onClick={() => navigate("/report")}
                  className="text-green-600 font-semibold hover:underline"
                >
                  See Detailed Report
                </button>
              </div>

              {/* Insights */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-lg font-semibold text-green-800 mb-4">
                  Insights
                </div>

                {/* Latest equivalents block */}
                {latestEquivalents &&
                  (latestEquivalents.trees_needed > 0 ||
                    latestEquivalents.car_miles > 0) && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                        🧠 Latest Entry Equivalents
                      </p>
                      <div className="space-y-1 text-sm text-indigo-700">
                        {latestEquivalents.trees_needed > 0 && (
                          <p>
                            🌳 {latestEquivalents.trees_needed} trees needed for
                            1 year
                          </p>
                        )}
                        {latestEquivalents.car_miles > 0 && (
                          <p>
                            🚗{" "}
                            {latestEquivalents.car_miles != null
                              ? latestEquivalents.car_miles.toLocaleString()
                              : 0}{" "}
                            miles of driving
                          </p>
                        )}
                        {latestEquivalents.smartphones_charged > 0 && (
                          <p>
                            📱{" "}
                            {latestEquivalents.smartphones_charged != null
                              ? latestEquivalents.smartphones_charged.toLocaleString()
                              : 0}{" "}
                            phones charged
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      High-Impact Areas
                    </div>
                    <p className="text-gray-600 text-sm">
                      {suggestions.highImpact}
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      AI Suggestion
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-gray-700 text-sm">
                      {suggestions.aiSuggestion}
                    </div>
                  </div>

                  {suggestions.extraAdvice.length > 0 && (
                    <div>
                      <div className="font-semibold text-green-800 mb-2">
                        More Tips
                      </div>
                      <ul className="space-y-1.5">
                        {suggestions.extraAdvice.map((tip, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 flex items-start gap-1.5"
                          >
                            <span className="shrink-0 mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Total footprint + mini bars */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-lg font-semibold text-green-800 mb-1">
                  Total Footprint
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {loading ? "…" : `${summary.totalCarbon} kg CO₂e`}
                </div>
                <div className="text-gray-600 text-sm mb-4">
                  {summary.totalRecords} records analyzed
                </div>

                {categoryBreakdown.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {categoryBreakdown.map(({ cat, pct }) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                          <span className="capitalize">
                            {CATEGORY_EMOJI[cat] || "📄"} {cat}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
                >
                  Export All Data
                </button>
              </div>
            </div>
          </div>
        </main>

        <ManualEntryModal
          isOpen={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          onSuccess={handleManualEntrySuccess}
        />
        <EditEntryModal
          isOpen={showEditEntry}
          onClose={handleCloseEdit}
          record={selectedRecord}
          onSuccess={handleEditEntrySuccess}
        />
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportComplete}
        />
      </div>
    </div>
  );
}

export default LandingPage;
