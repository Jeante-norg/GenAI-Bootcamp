const express=require('express');
const app=express();
const mongoose=require('mongoose');
const userRoutes=require("./Routes/user.route.js")
const AIRoutes=require("./Routes/AI.route.js")
const cookieParser=require("cookie-parser")
require('dotenv').config({path:'./config/.env'})
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("DB Connected"))
.catch((err)=>console.log(err))
const cors=require('cors')
app.use(cors({
    origin:["http://localhost:5173"],
    credentials: true
}))
app.use(express.json());
app.use(cookieParser())
app.use("/user",userRoutes)
app.use("/ai",AIRoutes)
app.listen(process.env.PORT,()=>{
    console.log(`server is running on http://localhost:${process.env.PORT}`)
})