
import { analyzeMessage } from "../services/analyzeService.js";

export const analyzeMessageController = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        if (typeof message !== "string") {
            return res.status(400).json({
                success: false,
                message: "Message must be a string"
            });
        }

        if (!message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 10000 characters"
            });
        }

        // Send the message to Python Analyzer
        const result = await analyzeMessage(message);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Analysis error:", error.message);

        if (
            error.code === "ECONNREFUSED" ||
            error.code === "ETIMEDOUT"
        ) {
            return res.status(503).json({
                success: false,
                message: "Python Analyzer is currently unavailable"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
