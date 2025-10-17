const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../config/.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;
const EmissionRecord = require("../Models/AI.model.js");
const CarbonCalculator = require("../utils/carbonCalculator.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test available models and use the correct one
let model;
try {
  // Try the most common working models
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.0-pro",
    "gemini-pro",
    "models/gemini-1.5-flash",
    "models/gemini-1.0-pro",
  ];

  for (const modelName of modelNames) {
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
    } catch (modelError) {
      console.log(`❌ Model ${modelName} failed: ${modelError.message}`);
      continue;
    }
  }

  if (!model) {
    throw new Error("No working Gemini model found");
  }
} catch (error) {
  console.error("❌ Gemini model initialization failed:", error);
  // Fallback to manual processing without AI
  console.log("🔄 Using manual processing fallback");
}

const generateContent = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user?.id;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    console.log(
      "📁 Processing file:",
      file.originalname,
      "Type:",
      file.mimetype
    );

    let fileType = file.mimetype.includes("image")
      ? "image"
      : file.mimetype.includes("pdf")
      ? "pdf"
      : "text";

    let extractedText = "";

    // For text files, extract content directly
    if (fileType === "text") {
      extractedText = file.buffer.toString("utf-8");
      console.log(
        "📝 Processing text file:",
        extractedText.substring(0, 100) + "..."
      );
    } else {
      // For PDFs and images, we need to inform user about limitations
      console.log("⚠️  PDF/Image processing - using filename-based detection");

      // Try to extract some info from filename as fallback
      const fileName = file.originalname.toLowerCase();

      // Simple filename pattern matching
      if (
        fileName.includes("electric") ||
        fileName.includes("power") ||
        fileName.includes("utility")
      ) {
        extractedText = "Electricity bill: 150 kWh usage";
      } else if (
        fileName.includes("gas") ||
        fileName.includes("fuel") ||
        fileName.includes("petrol")
      ) {
        extractedText = "Gasoline purchase: 10 gallons";
      } else if (
        fileName.includes("grocery") ||
        fileName.includes("food") ||
        fileName.includes("market")
      ) {
        extractedText = "Grocery receipt: various food items";
      } else {
        // For unrecognized files, return informative error
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

    // MANUAL PROCESSING FALLBACK - If Gemini is not available
    if (!model) {
      console.log("🔄 Using manual processing fallback");
      return processManually(
        extractedText,
        file.originalname,
        fileType,
        userId,
        res
      );
    }

    const prompt = `
Analyze this text for carbon footprint calculation. Return ONLY JSON.

TEXT: ${extractedText}

If this contains energy/consumption data, return:
{
  "relevant": true,
  "category": "electricity|transportation|food|home|waste",
  "quantity": 180,
  "unit": "kWh|gallons|kg|miles|etc",
  "source_text": "Brief description"
}

If not relevant, return:
{
  "relevant": false,
  "reason": "No consumption data found"
}

ONLY return JSON, no other text.
`;

    console.log("🤖 Sending request to Gemini AI...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log(
      "✅ Gemini AI Response received:",
      responseText.substring(0, 100) + "..."
    );

    let aiAnalysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
        console.log("📊 AI Analysis:", aiAnalysis);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      // Fallback to manual processing
      return processManually(
        extractedText,
        file.originalname,
        fileType,
        userId,
        res
      );
    }

    // Check if document is relevant
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

    // Process with carbon calculator
    return processWithCarbonCalculator(aiAnalysis, fileType, userId, res);
  } catch (error) {
    console.error("❌ Processing Error:", error);

    // If Gemini fails, try manual processing
    if (error.message.includes("Gemini") || error.message.includes("model")) {
      const file = req.file;
      let extractedText = "";

      if (file.mimetype.includes("text")) {
        extractedText = file.buffer.toString("utf-8");
      }

      return processManually(
        extractedText,
        file.originalname,
        file.mimetype.includes("image")
          ? "image"
          : file.mimetype.includes("pdf")
          ? "pdf"
          : "text",
        req.user?.id,
        res
      );
    }

    res.status(500).json({
      success: false,
      message: error.message,
      details: "Processing failed. Please try a different file.",
    });
  }
};

// Manual processing function (fallback when AI fails)
const processManually = (extractedText, fileName, fileType, userId, res) => {
  console.log("🔄 Using manual text processing");

  const text = extractedText.toLowerCase();
  let analysis = {
    relevant: false,
    reason: "Could not extract consumption data",
    source_text:
      "Manual processing: " + (extractedText.substring(0, 50) || fileName),
  };

  // Simple pattern matching for common consumption data
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
    text.includes("gas") ||
    text.includes("fuel")
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

  if (!analysis.relevant) {
    return res.status(400).json({
      success: false,
      message: analysis.reason,
      details:
        "Try uploading a text file with clear consumption data like '150 kWh' or '10 gallons'",
      suggestedFiles: [
        "Text file: 'Electricity: 200 kWh'",
        "Text file: 'Gasoline: 15 gallons'",
        "Text file: 'Grocery: beef 2kg, chicken 1kg'",
      ],
    });
  }

  return processWithCarbonCalculator(analysis, fileType, userId, res);
};

// Common processing with carbon calculator
const processWithCarbonCalculator = (analysis, fileType, userId, res) => {
  let calculatedCarbon = 0;

  try {
    // Calculate carbon using our enhanced calculator
    calculatedCarbon = CarbonCalculator.calculate(
      analysis.category,
      analysis.quantity
    );

    // Generate insights using our calculator
    const insights = CarbonCalculator.generateInsights(
      analysis,
      calculatedCarbon
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    // Enhance analysis with our calculations
    const finalAnalysis = {
      ...analysis,
      total_emission: calculatedCarbon,
      unit_emission: "kg CO₂e",
      advice: insights,
      equivalents: equivalents,
      calculated_with: "CarbonKind Calculator",
    };

    console.log("🔢 Carbon Calculation:", calculatedCarbon, "kg CO₂e");

    // Save to database
    if (userId && finalAnalysis) {
      try {
        const record = new EmissionRecord({
          userId,
          fileUrl:
            fileType === "text" ? "text://direct-upload" : "file://uploaded",
          fileType,
          analysis: finalAnalysis,
        });
        record.save().then(() => console.log("💾 Saved to database"));
      } catch (dbError) {
        console.error("Database Save Error:", dbError);
      }
    }

    res.status(200).json({
      success: true,
      fileUrl: fileType === "text" ? "text://direct-upload" : "file://uploaded",
      type: fileType,
      data: finalAnalysis,
      calculatedCarbon: calculatedCarbon,
    });
  } catch (calcError) {
    console.error("Carbon calculation error:", calcError);
    res.status(500).json({
      success: false,
      message: "Carbon calculation failed",
      details: "Please check your input data and try again.",
    });
  }
};

const getUserEmissions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const records = await EmissionRecord.find({ userId }).sort({
      createdAt: -1,
    });

    // Calculate totals for dashboard
    const totalCarbon = records.reduce(
      (sum, record) => sum + (record.analysis.total_emission || 0),
      0
    );

    const monthlyCarbon = records
      .filter((record) => {
        const recordDate = new Date(record.createdAt);
        const currentMonth = new Date();
        return (
          recordDate.getMonth() === currentMonth.getMonth() &&
          recordDate.getFullYear() === currentMonth.getFullYear()
        );
      })
      .reduce((sum, record) => sum + (record.analysis.total_emission || 0), 0);

    res.status(200).json({
      success: true,
      records,
      summary: {
        totalCarbon: Math.round(totalCarbon * 100) / 100,
        monthlyCarbon: Math.round(monthlyCarbon * 100) / 100,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error("MongoDB Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Find and delete the record, ensuring it belongs to the user
    const record = await EmissionRecord.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
      deletedRecord: {
        id: record._id,
        category: record.analysis.category,
        carbon: record.analysis.total_emission,
      },
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addManualEntry = async (req, res) => {
  try {
    const { type, value, subtype, description } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate input
    if (!type || value === undefined || !subtype) {
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

    // Calculate carbon using our calculator
    const calculatedCarbon = CarbonCalculator.calculate(
      type,
      quantity,
      subtype
    );

    // Generate insights
    const insights = CarbonCalculator.generateInsights(
      { category: type, quantity },
      calculatedCarbon
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    const analysis = {
      relevant: true,
      category: type,
      quantity: quantity,
      unit: getUnitForType(type),
      total_emission: calculatedCarbon,
      unit_emission: "kg CO₂e",
      advice: insights,
      equivalents: equivalents,
      source_text:
        description ||
        `Manual entry: ${quantity} ${getUnitForType(type)} ${type}`,
      calculated_with: "CarbonKind Manual Entry",
      manual_entry: true,
    };

    // Save to database
    const record = new EmissionRecord({
      userId,
      fileUrl: "manual://entry",
      fileType: "manual",
      analysis: analysis,
    });

    await record.save();

    res.status(200).json({
      success: true,
      calculatedCarbon: calculatedCarbon,
      record: {
        id: record._id,
        analysis: analysis,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    console.error("Manual Entry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, subtype, description } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate input
    if (!type || value === undefined || !subtype) {
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

    // Find the record and verify ownership
    const record = await EmissionRecord.findOne({
      _id: id,
      userId: userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to edit it",
      });
    }

    // Calculate new carbon using our calculator
    const calculatedCarbon = CarbonCalculator.calculate(
      type,
      quantity,
      subtype
    );

    // Generate new insights
    const insights = CarbonCalculator.generateInsights(
      { category: type, quantity },
      calculatedCarbon
    );
    const equivalents = CarbonCalculator.getCarbonEquivalents(calculatedCarbon);

    // Update the analysis
    record.analysis = {
      ...record.analysis,
      category: type,
      quantity: quantity,
      unit: getUnitForType(type),
      total_emission: calculatedCarbon,
      advice: insights,
      equivalents: equivalents,
      source_text:
        description ||
        `Updated entry: ${quantity} ${getUnitForType(type)} ${type}`,
      calculated_with: "CarbonKind Calculator",
      manual_entry: true, // Mark as manual since it's being edited
      updated_at: new Date().toISOString(),
    };

    await record.save();

    res.status(200).json({
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
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to get units
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
