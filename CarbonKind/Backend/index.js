const express=require('express');
const app=express();
const mongoose=require('mongoose');
const userRoutes=require("./Routes/user.route.js")
const cookieParser=require("cookie-parser")
require('dotenv').config({path:'./config/.env'})
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("DB Connected"))
.catch((err)=>console.log(err))
const cors=require('cors')
app.use(cors())
app.use(express.json());
app.use(cookieParser())
app.use("/user",userRoutes)
app.listen(process.env.PORT,()=>{
    console.log(`server is running on http://localhost:${process.env.PORT}`)
})