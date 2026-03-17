import React, { useState } from "react";
import { carbonAPI } from "../services/api.js";

const carbonTypes = {
  electricity: {
    subtypes: ["grid_average", "coal", "natural_gas", "solar", "wind", "hydro"],
    unit: "kWh",
    placeholder: "e.g., 150",
    hint: "Check your utility bill for exact kWh usage",
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
    placeholder: "e.g., 30 miles or 10 gallons",
    hint: "Use odometer readings for vehicle miles",
    emoji: "🚗",
  },
  food: {
    subtypes: ["beef", "chicken", "cheese", "pork", "vegetables", "fruits"],
    unit: "kg",
    placeholder: "e.g., 2.5",
    hint: "Weigh food purchases when possible",
    emoji: "🍽️",
  },
  home: {
    subtypes: ["natural_gas", "heating_oil", "propane"],
    unit: "therms / gallons",
    placeholder: "e.g., 25 therms",
    hint: "Check your gas bill for therms or CCF consumed",
    emoji: "🏠",
  },
  waste: {
    subtypes: ["landfill", "recycled", "composted"],
    unit: "kg",
    placeholder: "e.g., 15",
    hint: "Average household generates about 2 kg trash per day",
    emoji: "♻️",
  },
};

const emissionFactorPreview = {
  electricity: { grid_average: 0.385, solar: 0.05, coal: 0.96 },
  transportation: {
    gasoline: "8.887/gal",
    gas_vehicle: "0.24/mi",
    flight: "0.18/mi",
  },
  food: { beef: 27.0, chicken: 6.9, vegetables: 0.4 },
  home: { natural_gas: "5.3/therm", heating_oil: "10.21/gal" },
  waste: { landfill: 0.71, recycled: -0.21, composted: -0.11 },
};

const ManualEntryModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: "electricity",
    value: "",
    subtype: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const currentType = carbonTypes[formData.type];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    if (!formData.value || isNaN(formData.value)) {
      setError("Please enter a valid number");
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      setError("Please select a subtype");
      setLoading(false);
      return;
    }

    try {
      const res = await carbonAPI.addManualEntry(
        formData.type,
        formData.value,
        formData.subtype,
        formData.description,
      );

      if (res.success) {
        setResult(res);
        onSuccess(res.record);
        // Keep modal open briefly to show result, then close
        setTimeout(() => {
          onClose();
          setFormData({
            type: "electricity",
            value: "",
            subtype: "",
            description: "",
          });
          setResult(null);
        }, 2500);
      } else {
        setError(res.message || "Failed to add manual entry");
      }
    } catch (err) {
      setError(err.message || "Failed to add manual entry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const factorPreview =
    formData.subtype &&
    emissionFactorPreview[formData.type]?.[formData.subtype];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">
              Add Manual Entry
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Success result */}
          {result && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600 font-bold text-lg">✓</span>
                <span className="font-semibold text-green-800">
                  Entry added successfully
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Carbon calculated:{" "}
                <strong>{result.calculatedCarbon} kg CO₂e</strong>
              </p>
              {result.record?.analysis?.equivalents?.trees_needed > 0 && (
                <p className="text-green-600 text-xs mt-1">
                  🌳 {result.record.analysis.equivalents.trees_needed} trees ·
                  🚗{" "}
                  {result.record.analysis.equivalents.car_miles?.toLocaleString()}{" "}
                  miles · 📱{" "}
                  {result.record.analysis.equivalents.smartphones_charged?.toLocaleString()}{" "}
                  phones
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(carbonTypes).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: key, subtype: "" })
                    }
                    className={`p-2 rounded-lg border-2 text-center transition-colors ${
                      formData.type === key
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-lg">{val.emoji}</div>
                    <div className="text-xs capitalize mt-0.5 text-gray-600 leading-tight">
                      {key === "transportation" ? "Transport" : key}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype */}
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
              {factorPreview !== undefined && (
                <p className="text-xs text-indigo-600 mt-1">
                  🧠 Emission factor: {factorPreview} kg CO₂e /&nbsp;
                  {currentType.unit}
                </p>
              )}
            </div>

            {/* Value */}
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
              <p className="text-xs text-gray-400 mt-1">{currentType.hint}</p>
            </div>

            {/* Description */}
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
                placeholder="e.g., Monthly electricity bill"
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
                disabled={loading || !!result}
                className={`flex-1 ${
                  loading || result
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 rounded-md transition`}
              >
                {loading ? "Calculating…" : result ? "Done ✓" : "Add Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryModal;
