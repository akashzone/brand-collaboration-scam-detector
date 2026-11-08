import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/healthRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Scam Detector Backend is running!");
});

// Health API
app.use("/api/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});