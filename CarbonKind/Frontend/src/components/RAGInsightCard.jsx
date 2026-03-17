import React from "react";

const categoryEmoji = {
  electricity: "⚡",
  transportation: "🚗",
  food: "🍽️",
  home: "🏠",
  waste: "♻️",
  unknown: "📊",
};

const categoryColor = {
  electricity: "yellow",
  transportation: "blue",
  food: "orange",
  home: "purple",
  waste: "green",
  unknown: "gray",
};

const colorMap = {
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    title: "text-yellow-800",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-800",
    bar: "bg-yellow-400",
    equiv: "bg-yellow-100 text-yellow-800",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "text-blue-800",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    bar: "bg-blue-400",
    equiv: "bg-blue-100 text-blue-800",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    title: "text-orange-800",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
    bar: "bg-orange-400",
    equiv: "bg-orange-100 text-orange-800",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    title: "text-purple-800",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    bar: "bg-purple-400",
    equiv: "bg-purple-100 text-purple-800",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    title: "text-green-800",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-400",
    equiv: "bg-green-100 text-green-800",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    title: "text-gray-800",
    text: "text-gray-700",
    badge: "bg-gray-100 text-gray-800",
    bar: "bg-gray-400",
    equiv: "bg-gray-100 text-gray-800",
  },
};

function RAGInsightCard({ result, onDismiss }) {
  if (!result || !result.success) return null;

  const analysis = result.data || {};
  const category = analysis.category || "unknown";
  const color = colorMap[categoryColor[category] || "gray"];
  const emoji = categoryEmoji[category] || "📊";

  const carbon = analysis.total_emission ?? result.calculatedCarbon ?? 0;
  const advice = Array.isArray(analysis.advice) ? analysis.advice : [];
  const equivalents = analysis.equivalents || {};
  const quantity = analysis.quantity;
  const unit = analysis.unit;
  const sourceText = analysis.source_text || "";

  // Impact level
  const impactLevel = carbon > 100 ? "High" : carbon > 30 ? "Medium" : "Low";
  const impactColor =
    carbon > 100
      ? "text-red-600 bg-red-50"
      : carbon > 30
        ? "text-orange-600 bg-orange-50"
        : "text-green-600 bg-green-50";

  return (
    <div
      className={`rounded-xl border-2 ${color.border} ${color.bg} p-5 mt-4 relative`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`font-bold text-lg ${color.title} capitalize`}>
              {category} Emission Calculated
            </h3>
            {result.ragEnhanced && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                <span>🧠</span> RAG Enhanced
              </span>
            )}
          </div>
          {sourceText && (
            <p className={`text-sm ${color.text} truncate`}>{sourceText}</p>
          )}
        </div>
      </div>

      {/* Carbon result + impact */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className={`text-3xl font-extrabold ${color.title}`}>
            {carbon} kg CO₂e
          </div>
          {quantity && unit && (
            <div className={`text-sm ${color.text} mt-0.5`}>
              From {quantity} {unit}
            </div>
          )}
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${impactColor}`}
        >
          {impactLevel} Impact
        </span>
      </div>

      {/* Carbon equivalents */}
      {(equivalents.trees_needed ||
        equivalents.car_miles ||
        equivalents.smartphones_charged) && (
        <div className="mb-4">
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${color.title} mb-2`}
          >
            That's equivalent to…
          </p>
          <div className="flex flex-wrap gap-2">
            {equivalents.trees_needed > 0 && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${color.equiv}`}
              >
                🌳 {equivalents.trees_needed} trees for a year
              </span>
            )}
            {equivalents.car_miles > 0 && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${color.equiv}`}
              >
                🚗 {equivalents.car_miles.toLocaleString()} miles driven
              </span>
            )}
            {equivalents.smartphones_charged > 0 && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${color.equiv}`}
              >
                📱 {equivalents.smartphones_charged.toLocaleString()} phones
                charged
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI-generated advice */}
      {advice.length > 0 && (
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${color.title} mb-2`}
          >
            💡 Recommendations
          </p>
          <ul className="space-y-1.5">
            {advice.map((tip, i) => (
              <li
                key={i}
                className={`text-sm ${color.text} flex items-start gap-2`}
              >
                <span className="mt-0.5 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RAGInsightCard;
