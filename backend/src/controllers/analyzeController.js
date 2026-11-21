
import { analyzeMessage } from "../services/analyzeService.js";

export const analyzeMessageController = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MESSAGE_REQUIRED",
                    message: "Message is required."
                }
            });
        }

        if (typeof message !== "string") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MESSAGE_TYPE",
                    message: "Message must be a string."
                }
            });
        }

        if (!message.trim()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "EMPTY_MESSAGE",
                    message: "Message cannot be empty."
                }
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MESSAGE_TOO_LONG",
                    message: "Message cannot exceed 10000 characters."
                }
            });
        }

        const { data, warnings } = await analyzeMessage(message);

        return res.status(200).json({
            success: true,
            data,
            warnings
        });

    } catch (error) {
        next(error);
    }
};
