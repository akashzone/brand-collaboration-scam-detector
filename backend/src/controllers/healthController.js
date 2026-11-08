
export const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Scam Detector Backend is healthy",
        timestamp: new Date()
    });
};
