
export const analyzeMessage = (message) => {
    const trimmedMessage = message.trim();

    return {
        message: trimmedMessage,
        characterCount: trimmedMessage.length,
        status: "received"
    };
};
