"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../config/.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;
const EmissionRecord = require("../Models/AI.model.js");
const CarbonCalculator = require("../utils/carbonCalculator.js");
const { getRelevantContext } = require("../utils/ragPipeline.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let model = null;
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-1.0-pro",
  "gemini-pro",
  "models/gemini-1.5-flash",
  "models/gemini-1.0-pro",
];

for (const modelName of MODEL_CANDIDATES) {
  try {
    model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
    });
    console.log(`✅ Using Gemini model: ${modelName}`);
    break;
  } catch (err) {
    console.log(`❌ Model ${modelName} unavailable: ${err.message}`);
  }
}

if (!model) {
  console.error(
    "❌ No Gemini generative model available — will use manual fallback",
  );
}

// ─── generateContent ───────────────────────────────────────────────────────────

const generateContent = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user && req.user.id;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(
      "📁 Processing file:",
      file.originalname,
      "Type:",
      file.mimetype,
    );

    const fileType = file.mimetype.includes("image")
      ? "image"
      : file.mimetype.includes("pdf")
        ? "pdf"
        : "text";

    let extractedText = "";

    if (fileType === "text") {
      extractedText = file.buffer.toString("utf-8");
      console.log("📝 Text preview:", extractedText.substring(0, 100) + "…");
    } else {
      console.log("⚠️  PDF/Image — using filename heuristic");
      const lowerName = file.originalname.toLowerCase();

      if (
        lowerName.includes("electric") ||
        lowerName.includes("power") ||
        lowerName.includes("utility")
      ) {
        extractedText = "Electricity bill: 150 kWh usage";
      } else if (
        lowerName.includes("gas") ||
        lowerName.includes("fuel") ||
        lowerName.includes("petrol")
      ) {
        extractedText = "Gasoline purchase: 10 gallons";
      } else if (
        lowerName.includes("grocery") ||
        lowerName.includes("food") ||
        lowerName.includes("market")
      ) {
        extractedText = "Grocery receipt: various food items";
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported file type or content",
          details:
            "Please upload text files with consumption data. PDF/Image processing requires additional setup.",
          suggestedFiles: [
            "Text files with electricity usage (kWh)",
            "Text files with gasoline purchases (gallons)",
            "Text files with grocery items",
            "CSV files with consumption data",
          ],
        });
      }
    }

    if (!model) {
      console.log("🔄 No generative model — using manual fallback");
      return processManually(
        extractedText,
        file.originalname,
        fileType,
        userId,
        res,
      );
    }

    // RAG: keyword-based context retrieval (synchronous, no API calls)
    let ragContext = "";
    try {
      ragContext = getRelevantContext(extractedText);
    } catch (ragErr) {
      console.error("⚠️  RAG retrieval error (non-fatal):", ragErr.message);
    }

    const contextBlock =
      ragContext.trim().length > 0
        ? `RELEVANT CARBON KNOWLEDGE (use to improve extraction accuracy):\n${ragContext}\n\n`
        : "";

    const prompt =
      `${contextBlock}` +
      `Analyze this text for carbon footprint calculation. Return ONLY valid JSON.\n\n` +
      `TEXT: ${extractedText}\n\n` +
      `If this contains energy/consumption data, return:\n` +
      `{\n` +
      `  "relevant": true,\n` +
      `  "category": "electricity|transportation|food|home|waste",\n` +
      `  "quantity": 180,\n` +
      `  "unit": "kWh|gallons|kg|miles|therms",\n` +
      `  "source_text": "Brief description of what was found"\n` +
      `}\n\n` +
      `If not relevant, return:\n` +
      `{\n` +
      `  "relevant": false,\n` +
      `  "reason": "No consumption data found"\n` +
      `}\n\n` +
      `ONLY return JSON. No markdown, no explanation, no code fences.`;

    console.log(
      `🤖 Calling Gemini${ragContext ? " (RAG context injected)" : ""}…`,
    );

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("✅ Gemini response:", responseText.substring(0, 120) + "…");

    let aiAnalysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      aiAnalysis = JSON.parse(jsonMatch[0]);
      console.log("📊 Parsed AI analysis:", aiAnalysis);
    } catch (parseErr) {
      console.error(
        "❌ JSON parse error:",
        parseErr.message,
        "— falling back to manual",
      );
      return processManually(
        extractedText,
        file.originalname,
        fileType,
        userId,
        res,
      );
    }

    if (!aiAnalysis.relevant) {
      return res.status(400).json({
        success: false,
        message:
          aiAnalysis.reason || "Document not suitable for carbon calculation",
        suggestedFiles: [
          "Text files with electricity usage (kWh)",
          "Text files with gasoline purchases (gallons)",
          "Text files with food items",
          "Utility bill data in text format",
        ],
      });
    }

    return processWithCarbonCalculator(aiAnalysis, fileType, userId, res);
  } catch (error) {
    console.error("❌ generateContent error:", error.message);

    if (
      req.file &&
      (error.message.includes("Gemini") ||
        error.message.includes("model") ||
        error.message.includes("API"))
    ) {
      const file = req.file;
      const extractedText = file.mimetype.includes("text")
        ? file.buffer.toString("utf-8")
        : "";
      const fileType = file.mimetype.includes("image")
        ? "image"
        : file.mimetype.includes("pdf")
          ? "pdf"
          : "text";
      return processManually(
        extractedText,
        file.originalname,
        fileType,
        req.user && req.user.id,
        res,
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      details: "Processing failed. Please try a different file.",
    });
  }
};

// ─── processManually ───────────────────────────────────────────────────────────

const processManually = (extractedText, fileName, fileType, userId, res) => {
  console.log("🔄 Manual text processing");
  const text = (extractedText || "").toLowerCase();

  let analysis = null;

  if (text.includes("kwh") || text.includes("kilowatt")) {
    const match =
      text.match(/(\d+(\.\d+)?)\s*kwh/i) ||
      text.match(/(\d+(\.\d+)?)\s*kilowatt/i);
    if (match) {
      analysis = {
        relevant: true,
        category: "electricity",
        quantity: parseFloat(match[1]),
        unit: "kWh",
        source_text: "Electricity usage: " + match[1] + " kWh",
        confidence: "medium",
      };
    }
  } else if (
    text.includes("gallon") ||
    text.includes("fuel") ||
    text.includes("petrol")
  ) {
    const match = text.match(/(\d+(\.\d+)?)\s*gallons?/i);
    if (match) {
      analysis = {
        relevant: true,
        category: "transportation",
        quantity: parseFloat(match[1]),
        unit: "gallons",
        source_text: "Gasoline purchase: " + match[1] + " gallons",
        confidence: "medium",
      };
    }
  } else if (
    text.includes("beef") ||
    text.includes("chicken") ||
    text.includes("cheese")
  ) {
    analysis = {
      relevant: true,
      category: "food",
      quantity: 1,
      unit: "kg",
      source_text: "Food purchase detected",
      confidence: "low",
    };
  }

  if (!analysis) {
    return res.status(400).json({
      success: false,
      message: "Could not extract consumption data from document",
      details:
        "Try uploading a text file with clear consumption data like '150 kWh' or '10 gallons'",
      suggestedFiles: [
        "Text file containing 'Electricity: 200 kWh'",
        "Text file containing 'Gasoline: 15 gallons'",
        "Text file containing 'Grocery: beef 2kg, chicken 1kg'",
      ],
    });
  }

  return processWithCarbonCalculator(analysis, fileType, userId, res);
};

// ─── processWithCarbonCalculator ───────────────────────────────────────────────

const processWithCarbonCalculator = (analysis, fileType, userId, res) => {
  try {
    const calculatedCarbon = CarbonCalculator.calculate(
      analysis.category,
      analysis.quantity,
    );

    const insights = CarbonCalculator.generateInsights(
      analysis,
      calculatedCarbon,
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    const finalAnalysis = {
      ...analysis,
      total_emission: calculatedCarbon,
      unit_emission: "kg CO₂e",
      advice: insights,
      equivalents,
      calculated_with: "CarbonKind Calculator",
    };

    console.log("🔢 Calculated carbon:", calculatedCarbon, "kg CO₂e");

    if (userId) {
      const record = new EmissionRecord({
        userId,
        fileUrl:
          fileType === "text" ? "text://direct-upload" : "file://uploaded",
        fileType,
        analysis: finalAnalysis,
      });
      record
        .save()
        .then(() => console.log("💾 EmissionRecord saved"))
        .catch((dbErr) => console.error("❌ DB save error:", dbErr.message));
    }

    return res.status(200).json({
      success: true,
      fileUrl: fileType === "text" ? "text://direct-upload" : "file://uploaded",
      type: fileType,
      data: finalAnalysis,
      calculatedCarbon,
    });
  } catch (calcError) {
    console.error("❌ Carbon calculation error:", calcError.message);
    return res.status(500).json({
      success: false,
      message: "Carbon calculation failed",
      details: "Please check your input data and try again.",
    });
  }
};

// ─── getUserEmissions ──────────────────────────────────────────────────────────

const getUserEmissions = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const records = await EmissionRecord.find({ userId }).sort({
      createdAt: -1,
    });

    const totalCarbon = records.reduce(
      (sum, r) => sum + (r.analysis.total_emission || 0),
      0,
    );

    const now = new Date();
    const monthlyCarbon = records
      .filter((r) => {
        const d = new Date(r.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, r) => sum + (r.analysis.total_emission || 0), 0);

    return res.status(200).json({
      success: true,
      records,
      summary: {
        totalCarbon: Math.round(totalCarbon * 100) / 100,
        monthlyCarbon: Math.round(monthlyCarbon * 100) / 100,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error("❌ getUserEmissions error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── deleteEmissionRecord ─────────────────────────────────────────────────────

const deleteEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const record = await EmissionRecord.findOneAndDelete({ _id: id, userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Record deleted successfully",
      deletedRecord: {
        id: record._id,
        category: record.analysis.category,
        carbon: record.analysis.total_emission,
      },
    });
  } catch (error) {
    console.error("❌ deleteEmissionRecord error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── addManualEntry ───────────────────────────────────────────────────────────

const addManualEntry = async (req, res) => {
  try {
    const { type, value, subtype, description } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!type || value === undefined || value === null || !subtype) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: type, value, subtype",
      });
    }

    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Value must be a positive number",
      });
    }

    const calculatedCarbon = CarbonCalculator.calculate(
      type,
      quantity,
      subtype,
    );
    const insights = CarbonCalculator.generateInsights(
      { category: type, quantity },
      calculatedCarbon,
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    const analysis = {
      relevant: true,
      category: type,
      quantity,
      unit: getUnitForType(type),
      total_emission: calculatedCarbon,
      unit_emission: "kg CO₂e",
      advice: insights,
      equivalents,
      source_text:
        description ||
        `Manual entry: ${quantity} ${getUnitForType(type)} ${type}`,
      calculated_with: "CarbonKind Manual Entry",
      manual_entry: true,
    };

    const record = new EmissionRecord({
      userId,
      fileUrl: "manual://entry",
      fileType: "manual",
      analysis,
    });

    await record.save();

    return res.status(200).json({
      success: true,
      calculatedCarbon,
      record: {
        id: record._id,
        analysis,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ addManualEntry error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── updateEmissionRecord ─────────────────────────────────────────────────────

const updateEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, subtype, description } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!type || value === undefined || value === null || !subtype) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: type, value, subtype",
      });
    }

    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Value must be a positive number",
      });
    }

    const record = await EmissionRecord.findOne({ _id: id, userId });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to edit it",
      });
    }

    const calculatedCarbon = CarbonCalculator.calculate(
      type,
      quantity,
      subtype,
    );
    const insights = CarbonCalculator.generateInsights(
      { category: type, quantity },
      calculatedCarbon,
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    record.analysis = {
      ...record.analysis,
      category: type,
      quantity,
      unit: getUnitForType(type),
      total_emission: calculatedCarbon,
      advice: insights,
      equivalents,
      source_text:
        description ||
        `Updated entry: ${quantity} ${getUnitForType(type)} ${type}`,
      calculated_with: "CarbonKind Calculator",
      manual_entry: true,
      updated_at: new Date().toISOString(),
    };

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Record updated successfully",
      record: {
        id: record._id,
        analysis: record.analysis,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ updateEmissionRecord error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const getUnitForType = (type) => {
  const units = {
    electricity: "kWh",
    transportation: "miles",
    food: "kg",
    home: "therms",
    waste: "kg",
  };
  return units[type] || "units";
};

module.exports = {
  generateContent,
  getUserEmissions,
  deleteEmissionRecord,
  addManualEntry,
  updateEmissionRecord,
};
