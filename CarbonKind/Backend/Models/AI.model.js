const mongoose = require("mongoose");

const EmissionRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    analysis: { type: Object, required: true }, // JSON from Gemini
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmissionRecord", EmissionRecordSchema);