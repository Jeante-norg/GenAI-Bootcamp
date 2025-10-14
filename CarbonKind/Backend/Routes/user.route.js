const {Login,SignUp}=require("../Controllers/user.controller.js")
const router=require("express").Router()
router.post("/signup",SignUp)
router.post("/login",Login)
module.exports=router