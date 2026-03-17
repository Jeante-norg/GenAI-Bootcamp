"use strict";

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user.route.js");
const AIRoutes = require("./Routes/AI.route.js");
const exportRoutes = require("./Routes/export.route.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config({ path: "./config/.env" });

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
    initializeRAG();
  })
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

/**
 * Initialize the keyword-based RAG store.
 * Synchronous internally — no network calls, no embeddings.
 * Runs after DB connect so logs appear in order, but blocking is negligible.
 */
const initializeRAG = () => {
  try {
    const knowledgeBase = require("./utils/knowledgeBase.json");
    const { buildStore } = require("./utils/vectorStore");
    const { successCount, failCount } = buildStore(knowledgeBase);
    console.log(
      `🧠 RAG system ready: ${successCount}/${knowledgeBase.length} chunks loaded${
        failCount > 0 ? ` (${failCount} skipped)` : ""
      }`,
    );
  } catch (error) {
    console.error(
      "❌ RAG initialization failed:",
      error.message,
      "— continuing without context augmentation",
    );
  }
};

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/ai", AIRoutes);
app.use("/export", exportRoutes);

app.get("/api/health", (req, res) => {
  let ragStatus = { ready: false, chunks: 0 };
  try {
    const { isReady, getStoreSize } = require("./utils/vectorStore");
    ragStatus = { ready: isReady(), chunks: getStoreSize() };
  } catch (_) {}

  res.json({
    status: "✅ CarbonKind Backend is Running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    rag: ragStatus,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 CarbonKind server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
