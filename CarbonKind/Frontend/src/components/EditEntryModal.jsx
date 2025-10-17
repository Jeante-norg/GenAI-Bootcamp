import React, { useState, useEffect } from "react";
import { carbonAPI } from "../services/api.js";

const EditEntryModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: "electricity",
    value: "",
    subtype: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const carbonTypes = {
    electricity: {
      subtypes: [
        "grid_average",
        "coal",
        "natural_gas",
        "solar",
        "wind",
        "hydro",
      ],
      unit: "kWh",
      placeholder: "e.g., 150",
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
      unit: "miles/gallons",
      placeholder: "e.g., 30 miles or 10 gallons",
    },
    food: {
      subtypes: ["beef", "chicken", "cheese", "pork", "vegetables", "fruits"],
      unit: "kg",
      placeholder: "e.g., 2.5",
    },
    home: {
      subtypes: ["natural_gas", "heating_oil", "propane"],
      unit: "therms/gallons",
      placeholder: "e.g., 25 therms",
    },
    waste: {
      subtypes: ["landfill", "recycled", "composted"],
      unit: "kg",
      placeholder: "e.g., 15",
    },
  };

  // Initialize form with record data when modal opens
  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        type: record.analysis.category || "electricity",
        value: record.analysis.quantity || "",
        subtype: record.analysis.subtype || "",
        description:
          record.analysis.source_text?.replace(
            /^(Manual entry|Updated entry|Electricity usage|Gasoline purchase):\s*/i,
            ""
          ) || "",
      });
      setError("");
    }
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      const result = await carbonAPI.updateEmissionRecord(
        record._id,
        formData.type,
        formData.value,
        formData.subtype,
        formData.description
      );

      if (result.success) {
        onSuccess(result.record);
        onClose();
      } else {
        setError(result.message || "Failed to update entry");
      }
    } catch (error) {
      setError(error.message || "Failed to update entry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Edit Entry</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Original Entry</h3>
            <p className="text-blue-700 text-sm">
              Category:{" "}
              <span className="capitalize">{record.analysis.category}</span>
            </p>
            <p className="text-blue-700 text-sm">
              Value: {record.analysis.quantity} {record.analysis.unit}
            </p>
            <p className="text-blue-700 text-sm">
              Carbon: {record.analysis.total_emission} kg CO₂e
            </p>
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
                <option value="electricity">Electricity</option>
                <option value="transportation">Transportation</option>
                <option value="food">Food</option>
                <option value="home">Home Energy</option>
                <option value="waste">Waste</option>
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
                <option value="">Select type...</option>
                {carbonTypes[formData.type].subtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value ({carbonTypes[formData.type].unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={carbonTypes[formData.type].placeholder}
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 rounded-md transition`}
              >
                {loading ? "Updating..." : "Update Entry"}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Note</h3>
            <p className="text-sm text-yellow-700">
              Editing this entry will recalculate the carbon footprint based on
              your changes. The original data will be updated and cannot be
              recovered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEntryModal;
