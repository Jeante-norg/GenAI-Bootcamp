const express=require("express");
const router=express.Router();
const { generateContent,getUserEmissions } = require("../Controllers/AI.controller");
const { singleUpload } = require("../Middlewares/Multer");
const {jwtVerify}=require("../Middlewares/jwt-verify");
router.post("/generate",jwtVerify, singleUpload, generateContent);
router.get("/user-emissions", jwtVerify, getUserEmissions);
module.exports=router;