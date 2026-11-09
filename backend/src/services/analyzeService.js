
import axios from "axios";

export const analyzeMessage = async (message) => {
    const response = await axios.post(
        `${process.env.ANALYZER_URL}/analyze`,
        {
            message
        }
    );

    return response.data.data;
};
