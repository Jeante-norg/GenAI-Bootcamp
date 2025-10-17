const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user.route.js");
const AIRoutes = require("./Routes/AI.route.js");
const exportRoutes = require("./Routes/export.route.js");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/.env" });

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/user", userRoutes);
app.use("/ai", AIRoutes);
app.use("/export", exportRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ CarbonKind Backend is Running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler - FIXED: Use proper route pattern
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
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
