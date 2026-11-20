
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";

// Middleware
import { errorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Scam Detector Backend is running!");
});

// API Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/health", healthRoutes);

// Centralized Error Handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
