import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Scam Detector Backend is running!");
});

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"Backend is healthy",
        timestamp: new Date().toISOString()
    })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});