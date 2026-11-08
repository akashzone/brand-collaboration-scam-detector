
import { analyzeMessage } from "../services/analyzeService.js";

export const analyzeMessageController = (req, res) => {
    try {
        const { message } = req.body;

        // Check whether message exists
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        // Check whether message is a string
        if (typeof message !== "string") {
            return res.status(400).json({
                success: false,
                message: "Message must be a string"
            });
        }

        // Check whether message is empty
        if (!message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        // Check message length
        if (message.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 10000 characters"
            });
        }

        const result = analyzeMessage(message);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Analysis error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
