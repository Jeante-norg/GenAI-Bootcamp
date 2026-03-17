import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";

const carbonTypes = {
  electricity: {
    subtypes: ["grid_average", "coal", "natural_gas", "solar", "wind", "hydro"],
    unit: "kWh",
    placeholder: "e.g., 150",
    emoji: "⚡",
  },
  transportation: {
    subtypes: [
      "gasoline",
      "diesel",
      "electric_vehicle",
      "gas_vehicle",
      "public_transit",
      "flight",
    ],
    unit: "miles / gallons",
    placeholder: "e.g., 30",
    emoji: "🚗",
  },
  food: {
    subtypes: ["beef", "chicken", "cheese", "pork", "vegetables", "fruits"],
    unit: "kg",
    placeholder: "e.g., 2.5",
    emoji: "🍽️",
  },
  home: {
    subtypes: ["natural_gas", "heating_oil", "propane"],
    unit: "therms / gallons",
    placeholder: "e.g., 25",
    emoji: "🏠",
  },
  waste: {
    subtypes: ["landfill", "recycled", "composted"],
    unit: "kg",
    placeholder: "e.g., 15",
    emoji: "♻️",
  },
};

const EditEntryModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: "electricity",
    value: "",
    subtype: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updateResult, setUpdateResult] = useState(null);

  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        type: record.analysis.category || "electricity",
        value: record.analysis.quantity || "",
        subtype: record.analysis.subtype || "",
        description:
          record.analysis.source_text?.replace(
            /^(Manual entry|Updated entry|Electricity usage|Gasoline purchase):\s*/i,
            "",
          ) || "",
      });
      setError("");
      setUpdateResult(null);
    }
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUpdateResult(null);

    if (!formData.value || isNaN(formData.value)) {
      setError("Please enter a valid number");
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      setError("Please select a type");
      setLoading(false);
      return;
    }

    try {
      const res = await carbonAPI.updateEmissionRecord(
        record._id,
        formData.type,
        formData.value,
        formData.subtype,
        formData.description,
      );

      if (res.success) {
        setUpdateResult(res);
        onSuccess(res.record);
        setTimeout(() => {
          onClose();
          setUpdateResult(null);
        }, 2000);
      } else {
        setError(res.message || "Failed to update entry");
      }
    } catch (err) {
      setError(err.message || "Failed to update entry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  const currentType = carbonTypes[formData.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Edit Entry</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Update success */}
          {updateResult && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600 font-bold">✓</span>
                <span className="font-semibold text-green-800">
                  Updated successfully
                </span>
              </div>
              <p className="text-green-700 text-sm">
                New carbon:{" "}
                <strong>
                  {updateResult.record?.analysis?.total_emission} kg CO₂e
                </strong>
              </p>
              {updateResult.record?.analysis?.equivalents?.trees_needed > 0 && (
                <p className="text-green-600 text-xs mt-1">
                  🌳 {updateResult.record.analysis.equivalents.trees_needed}{" "}
                  trees · 🚗{" "}
                  {updateResult.record.analysis.equivalents.car_miles?.toLocaleString()}{" "}
                  miles
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Original entry */}
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">
              Original Entry
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Category</p>
                <p className="font-medium text-gray-700 capitalize">
                  {carbonTypes[record.analysis.category]?.emoji || "📄"}{" "}
                  {record.analysis.category}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Value</p>
                <p className="font-medium text-gray-700">
                  {record.analysis.quantity} {record.analysis.unit}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Carbon</p>
                <p className="font-medium text-green-700">
                  {record.analysis.total_emission} kg
                </p>
              </div>
            </div>
            {record.analysis.equivalents?.trees_needed > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                🌳 {record.analysis.equivalents.trees_needed} trees · 🚗{" "}
                {record.analysis.equivalents.car_miles?.toLocaleString()} miles
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                    subtype: "",
                  })
                }
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              >
                {Object.entries(carbonTypes).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.subtype}
                onChange={(e) =>
                  setFormData({ ...formData, subtype: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              >
                <option value="">Select type…</option>
                {currentType.subtypes.map((s) => (
                  <option key={s} value={s}>
                    {s
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value ({currentType.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={currentType.placeholder}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g., Monthly electricity usage"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !!updateResult}
                className={`flex-1 ${
                  loading || updateResult
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 rounded-md transition`}
              >
                {loading
                  ? "Updating…"
                  : updateResult
                    ? "Done ✓"
                    : "Update Entry"}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ Updating will recalculate carbon using current emission
              factors. The original data cannot be recovered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEntryModal;
