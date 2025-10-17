const express = require("express");
const router = express.Router();
const {
  generateContent,
  getUserEmissions,
  deleteEmissionRecord,
  addManualEntry,
  updateEmissionRecord,
} = require("../Controllers/AI.controller");
const { singleUpload } = require("../Middlewares/Multer");
const { jwtVerify } = require("../Middlewares/jwt-verify");

router.post("/generate", jwtVerify, singleUpload, generateContent);
router.get("/user-emissions", jwtVerify, getUserEmissions);
router.delete("/record/:id", jwtVerify, deleteEmissionRecord);
router.post("/manual-entry", jwtVerify, addManualEntry);
router.put("/record/:id", jwtVerify, updateEmissionRecord);

module.exports = router;
