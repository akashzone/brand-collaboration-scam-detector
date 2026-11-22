import { apiClient, ANALYZE_TIMEOUT_MS, HEALTH_TIMEOUT_MS } from "./apiClient.js";
import { createApiError, toApiError } from "./apiErrors.js";

export const MAX_MESSAGE_LENGTH = 10_000;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Check the envelope of a POST /api/analyze response:
 *   { success: true, data: {...}, warnings: [...] }
 * Nested fields are validated later, where each report section is built, so
 * that one malformed component doesn't discard the rest of the report.
 */
export function parseAnalysisResponse(body) {
  if (!isPlainObject(body) || body.success !== true || !isPlainObject(body.data)) {
    throw createApiError("INVALID_RESPONSE");
  }

  return {
    data: body.data,
    warnings: Array.isArray(body.warnings) ? body.warnings.filter(isPlainObject) : []
  };
}

/** POST /api/analyze */
export async function analyzeMessage(message, { signal } = {}) {
  try {
    const response = await apiClient.post(
      "/api/analyze",
      { message },
      { signal, timeout: ANALYZE_TIMEOUT_MS }
    );
    return parseAnalysisResponse(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /api/health — true only when the Express backend reports itself healthy. */
export async function checkHealth({ signal } = {}) {
  try {
    const response = await apiClient.get("/api/health", { signal, timeout: HEALTH_TIMEOUT_MS });
    return response.data?.success === true && response.data?.status === "healthy";
  } catch {
    return false;
  }
}
