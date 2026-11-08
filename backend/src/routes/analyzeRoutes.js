
import express from "express";
import { analyzeMessageController } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzeMessageController);

export default router;
