
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/healthRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { config } from "./config/env.js";

const app = express();

app.use(cors({
    origin: config.frontendUrl
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Scam Detector Backend is running!");
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/health", healthRoutes);

app.use(errorMiddleware);

export default app;
