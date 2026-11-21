
export const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        service: "scam-detector-backend",
        status: "healthy",
        message: "Scam Detector Backend is running successfully.",
        timestamp: new Date().toISOString()
    });
};
