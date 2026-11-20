
export const errorMiddleware = (err, req, res, next) => {
    console.error("API Error:", err.message);

    // FastAPI did not respond within the configured timeout.
    if (
        err.code === "ECONNABORTED" ||
        err.code === "ETIMEDOUT"
    ) {
        return res.status(504).json({
            success: false,
            error: {
                code: "ANALYZER_TIMEOUT",
                message: "Analysis service took too long to respond."
            }
        });
    }

    // FastAPI server is unavailable.
    if (err.code === "ECONNREFUSED") {
        return res.status(503).json({
            success: false,
            error: {
                code: "ANALYZER_UNAVAILABLE",
                message: "Analysis service is currently unavailable."
            }
        });
    }

    // FastAPI responded with an error.
    if (err.response) {
        return res.status(502).json({
            success: false,
            error: {
                code: "ANALYZER_ERROR",
                message: "Analysis service encountered an error."
            }
        });
    }

    // Any other unexpected error.
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected server error occurred."
        }
    });
};
