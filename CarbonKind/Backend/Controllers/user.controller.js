const userModel=require("../Models/user.model.js")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const SignUp=async(req,res)=>{
    const {username,email,password}=req.body;
    try {
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=await userModel.create({username,email,password:hashedPassword});
        const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.cookie("token",token,{httpOnly:true,sameSite:'lax',maxAge:24*60*60*1000})
        res.status(201).json({
            success:true
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const Login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await userModel.findOne({
            email:email
        });
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found Please Sign Up"
            })
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.cookie("token",token,{httpOnly:true,sameSite:'lax',maxAge:24*60*60*1000})
        res.status(200).json({
            success:true,
            data:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports={SignUp,Login}