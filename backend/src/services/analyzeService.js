
import axios from "axios";

export const analyzeMessage = async (message) => {
    const response = await axios.post(
        `${process.env.ANALYZER_URL}/analyze`,
        {
            message
        },
        {
            timeout: 30000
        }
    );

    return response.data.data;
};
