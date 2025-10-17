const express = require("express");
const router = express.Router();
const {
  exportUserData,
  generateSustainabilityReport,
} = require("../Controllers/export.controller");
const { jwtVerify } = require("../Middlewares/jwt-verify");

router.get("/export", jwtVerify, exportUserData);
router.get("/sustainability-report", jwtVerify, generateSustainabilityReport);

module.exports = router;
