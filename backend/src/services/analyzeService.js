
import axios from "axios";
import { config } from "../config/env.js";

export const analyzeMessage = async (message) => {
    const response = await axios.post(
        `${config.analyzerUrl}/analyze`,
        {
            message
        },
        {
            timeout: 60000
        }
    );

    const data = response.data.data;

    const warnings = [];

    // Check Gemini availability
    if (data.llmAnalysis?.status === "unavailable") {
        warnings.push({
            component: "llm",
            message: "LLM analysis was unavailable."
        });
    }

    // Check RDAP availability
    for (const domain of data.domainAnalysis ?? []) {
        if (
            domain.status === "unavailable" ||
            domain.status === "rate_limited"
        ) {
            warnings.push({
                component: "domain",
                domain: domain.domain,
                message: "Domain intelligence was unavailable."
            });
        }
    }

    // Check URL analysis availability
    for (const url of data.urlAnalysis ?? []) {
        if (!["analysis_completed", "invalid_url"].includes(url.status)) {
            warnings.push({
                component: "url",
                message: "URL analysis was unavailable."
            });
        }
    }

    return {
        data,
        warnings
    };
};
