
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/healthRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Scam Detector Backend is running!");
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/health", healthRoutes);

app.use(errorMiddleware);

export default app;
