
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const analyzerUrl = process.env.ANALYZER_URL;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT configuration. Use a port between 1 and 65535.");
}

if (!analyzerUrl) {
    throw new Error("ANALYZER_URL is missing from environment configuration.");
}

let parsedAnalyzerUrl;

try {
    parsedAnalyzerUrl = new URL(analyzerUrl);
} catch {
    throw new Error("ANALYZER_URL must be a valid URL.");
}

if (
    !["http:", "https:"].includes(parsedAnalyzerUrl.protocol) ||
    !parsedAnalyzerUrl.hostname ||
    parsedAnalyzerUrl.username ||
    parsedAnalyzerUrl.password
) {
    throw new Error("ANALYZER_URL must be a valid HTTP or HTTPS URL without credentials.");
}


const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
    throw new Error("FRONTEND_URL is missing from environment configuration.");
}

let parsedFrontendUrl;

try {
    parsedFrontendUrl = new URL(frontendUrl);
} catch {
    throw new Error("FRONTEND_URL must be a valid URL.");
}

if (
    !["http:", "https:"].includes(parsedFrontendUrl.protocol) ||
    parsedFrontendUrl.username ||
    parsedFrontendUrl.password
) {
    throw new Error("FRONTEND_URL must be a valid HTTP or HTTPS URL.");
}

export const config = {
    port,
    analyzerUrl: parsedAnalyzerUrl.origin,
    frontendUrl: parsedFrontendUrl.origin
};