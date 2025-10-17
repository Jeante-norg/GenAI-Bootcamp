import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import ManualEntryModal from "./ManualEntryModal.jsx";
import EditEntryModal from "./EditEntryModal.jsx";
import ExportModal from "./ExportModal.jsx";

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
  const navigate = useNavigate();

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
      // If unauthorized, redirect to login
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

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
      "text/csv",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please select a PDF, JPG, PNG, or text file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const result = await carbonAPI.uploadDocument(file);

      if (result.success) {
        // Show success message without alert
        console.log(
          `File processed successfully! Carbon calculated: ${
            result.data.total_emission || result.calculatedCarbon || 0
          } kg CO₂e`
        );

        // Refresh the emissions data
        await fetchUserEmissions();

        // Reset file input
        document.getElementById("fileUpload").value = "";

        // Show subtle success indicator
        const uploadArea = document.querySelector(".border-green-500");
        if (uploadArea) {
          uploadArea.classList.add("bg-green-100");
          setTimeout(() => {
            uploadArea.classList.remove("bg-green-100");
          }, 2000);
        }
      } else {
        alert(`Upload failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload error: ${error.message || "Please try again"}`);
    } finally {
      setUploading(false);
    }
  };

  // Calculate percentage change (mock data for now)
  const calculatePercentageChange = () => {
    // In a real app, you'd compare with previous month
    return 15; // Mock 15% increase
  };

  // Get latest AI suggestions
  const getLatestSuggestions = () => {
    if (emissionsData.length === 0) {
      return {
        highImpact: "Start uploading documents to get insights",
        aiSuggestion: "Upload your first bill or receipt to begin tracking",
      };
    }

    const latestRecord = emissionsData[0];
    const analysis = latestRecord.analysis;

    return {
      highImpact: analysis.category
        ? `${
            analysis.category.charAt(0).toUpperCase() +
            analysis.category.slice(1)
          } contributes significantly to your emissions`
        : "Analyzing your emission patterns",
      aiSuggestion:
        analysis.advice && analysis.advice.length > 0
          ? analysis.advice[0]
          : "Continue tracking to get personalized recommendations",
    };
  };

  // Navigate to detailed report
  const handleViewReport = () => {
    navigate("/report");
  };

  // Handle manual entry success
  const handleManualEntrySuccess = (newEntry) => {
    console.log("Manual entry added:", newEntry);
    // Refresh data to show the new entry
    fetchUserEmissions();
  };

  // Handle edit entry success
  const handleEditEntrySuccess = (updatedEntry) => {
    console.log("Entry updated:", updatedEntry);
    // Refresh data to show the updated entry
    fetchUserEmissions();
  };

  // Handle export completion
  const handleExportComplete = (result) => {
    if (result.success) {
      console.log("Export completed successfully:", result);
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  // Open edit modal
  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowEditEntry(true);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setShowEditEntry(false);
    setSelectedRecord(null);
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserEmissions();
  }, []);

  const suggestions = getLatestSuggestions();
  const percentageChange = calculatePercentageChange();

  return (
    <div className="bg-gray-50 min-h-screen w-full flex justify-center">
      <div className="w-full max-w-7xl p-5 text-gray-800">
        {/* Main Section */}
        <main>
          <h1 className="text-3xl font-semibold text-green-800 mb-8">
            Dashboard
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
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
                      onClick={handleViewReport}
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

                <div className="border-2 border-dashed border-green-500 bg-green-50 rounded-lg text-center py-10 px-6 mb-6 transition-colors duration-200">
                  <p className="text-gray-600 mb-2">
                    Upload your bills or activity logs
                  </p>
                  <p className="text-gray-600 mb-4">
                    AI will calculate your carbon footprint instantly
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {/* Hidden file input */}
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".pdf,.jpg,.png,.jpeg,.txt,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      disabled={uploading}
                    />

                    {/* Custom styled label acts as a button */}
                    <label
                      htmlFor="fileUpload"
                      className={`inline-block ${
                        uploading
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-700"
                      } text-white font-semibold px-5 py-2 rounded-lg cursor-pointer transition duration-200`}
                    >
                      {uploading ? "Processing..." : "Choose File"}
                    </label>

                    {/* Manual Entry Button */}
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="bg-white text-green-700 border border-green-500 hover:bg-green-100 font-semibold px-5 py-2 rounded-lg transition duration-200"
                    >
                      + Manual Entry
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    {uploading
                      ? "Analyzing your document..."
                      : "Accepted formats: .pdf, .jpg, .png, .txt, .csv"}
                  </p>
                  {uploading && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-green-800">
                      Recent Uploads {loading && "(Loading...)"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {emissionsData.length} total records
                    </span>
                  </div>

                  {emissionsData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {loading
                        ? "Loading your data..."
                        : "No documents uploaded yet"}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {emissionsData.slice(0, 5).map((record, index) => (
                        <div
                          key={record._id}
                          className="flex justify-between items-center border-b border-gray-200 pb-3"
                        >
                          <div>
                            <div className="font-medium text-gray-700">
                              {record.analysis.manual_entry
                                ? "📝 Manual Entry"
                                : `Document ${index + 1}`}
                              <span className="ml-2 text-sm text-green-600 capitalize">
                                ({record.analysis.category || "Unknown"})
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(record.createdAt).toLocaleDateString()}
                              {record.analysis.source_text &&
                                ` • ${record.analysis.source_text.substring(
                                  0,
                                  30
                                )}...`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-700 font-semibold">
                              {record.analysis.total_emission
                                ? `${record.analysis.total_emission} kg CO₂e`
                                : "Calculating..."}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditRecord(record)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                title="Edit this record"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this record?"
                                    )
                                  ) {
                                    try {
                                      const result =
                                        await carbonAPI.deleteEmissionRecord(
                                          record._id
                                        );
                                      if (result.success) {
                                        // Refresh the data
                                        await fetchUserEmissions();
                                      } else {
                                        alert(
                                          "Failed to delete record: " +
                                            result.message
                                        );
                                      }
                                    } catch (error) {
                                      alert(
                                        "Error deleting record: " +
                                          error.message
                                      );
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                title="Delete this record"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Monthly Footprint */}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-lg font-semibold text-green-800 mb-2">
                  This Month's Footprints
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  {loading ? "..." : `${summary.monthlyCarbon} kg CO₂e`}
                </div>
                <div
                  className={`font-medium mb-3 ${
                    percentageChange > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {percentageChange > 0 ? "↑" : "↓"}
                  {Math.abs(percentageChange)}% from last month
                </div>
                <button
                  onClick={handleViewReport}
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
                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      High-Impact Areas
                    </div>
                    <p className="text-gray-600">{suggestions.highImpact}</p>
                  </div>

                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      AI Suggestion
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-gray-700">
                      {suggestions.aiSuggestion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-lg font-semibold text-green-800 mb-2">
                  Total Footprint
                </div>
                <div className="text-2xl font-bold text-green-700 mb-2">
                  {loading ? "..." : `${summary.totalCarbon} kg CO₂e`}
                </div>
                <div className="text-gray-600">
                  {summary.totalRecords} documents analyzed
                </div>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
                >
                  Export All Data
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Manual Entry Modal */}
        <ManualEntryModal
          isOpen={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          onSuccess={handleManualEntrySuccess}
        />

        {/* Edit Entry Modal */}
        <EditEntryModal
          isOpen={showEditEntry}
          onClose={handleCloseEdit}
          record={selectedRecord}
          onSuccess={handleEditEntrySuccess}
        />

        {/* Export Modal */}
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
