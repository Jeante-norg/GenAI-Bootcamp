const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../config/.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;
const EmissionRecord = require("../models/AI.model.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig:{
    temperature:0.2,
    topP:1.0,
  }
});

const generateContent = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user?._id;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const mime = file.mimetype;
    let fileType = "unknown";
    let contextPrompt = "";
    
    if (mime.includes("pdf")) {
      fileType = "pdf";
      contextPrompt = "User uploaded a PDF document (bills, invoices, logs). Extract text via OCR.";
    } else if (mime.includes("image")) {
      fileType = "image";
      contextPrompt = "User uploaded an image (bill, invoice, receipt). Extract text via OCR.";
    } else if (mime.includes("text") || mime.includes("csv")) {
      fileType = "text";
      contextPrompt = "User uploaded a text/CSV file containing emission data. Parse directly.";
    } else {
      contextPrompt = "Unknown file type. Extract any readable content.";
    }
    let prompt = `
You are CarbonKind, an AI-powered sustainability assistant.
${contextPrompt}

TASK:
Analyze the document and extract emission-related data including:
1. Category (electricity, transportation, waste, etc.)
2. Quantity used
3. Unit of measurement
4. Calculate CO₂e emissions using appropriate emission factors
5. Provide 2-3 actionable suggestions to reduce emissions

FORMAT YOUR RESPONSE AS JSON:
{
  "category": "electricity",
  "quantity": 180,
  "unit": "kWh",
  "emission_factor": 0.82,
  "total_emission": 147.6,
  "unit_emission": "kg CO₂e",
  "advice": ["Switch to renewable energy sources.", "Reduce peak-hour usage."],
  "source_text": "Brief description of extracted data"
}

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

    if (fileType === "text") {
      prompt += `\n\nDOCUMENT CONTENT:\n${file.buffer.toString("utf-8")}`;
    } else {
      prompt += `\n\nFILE INFORMATION:\n- File Type: ${fileType}\n- File URL: ${fileUrl}\n- Note: This is a ${fileType} file that would typically require OCR processing.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { raw_response: responseText };
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      parsed = { 
        error: "Failed to parse AI response", 
        raw_response: responseText 
      };
    }
    if (userId && parsed && !parsed.error) {
      try {
        const record = new EmissionRecord({ 
          userId, 
          fileUrl, 
          fileType, 
          analysis: parsed 
        });
        await record.save();
      } catch (dbError) {
        console.error("Database Save Error:", dbError);

      }
    }

    res.status(200).json({ 
      success: true, 
      fileUrl, 
      type: fileType, 
      data: parsed 
    });

  } catch (error) {
    console.error("Gemini/Cloudinary/MongoDB Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: "AI processing failed. Please try again with a different file." 
    });
  }
};

const getUserEmissions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const records = await EmissionRecord.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error("MongoDB Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateContent, getUserEmissions };