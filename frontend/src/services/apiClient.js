import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

/** Base URL of the Express backend. The frontend never calls FastAPI directly. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/**
 * Express waits up to 60 s for the analyzer before returning 504
 * ANALYZER_TIMEOUT. The client waits a little longer so that the backend's
 * more specific error arrives first.
 */
export const ANALYZE_TIMEOUT_MS = 75_000;
export const HEALTH_TIMEOUT_MS = 5_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});
