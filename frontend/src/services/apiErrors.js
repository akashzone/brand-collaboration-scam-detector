import axios from "axios";
import { API_BASE_URL } from "./apiClient.js";

/**
 * A user-presentable error. `field` is set when the problem is with the
 * message itself and should be shown next to the input.
 */
export class ApiError extends Error {
  constructor({ code, title, message, retryable = false, field = false }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.title = title;
    this.retryable = retryable;
    this.field = field;
  }
}

/** Copy for every error code the Express backend can return, plus client-side failures. */
const ERROR_COPY = {
  // Express validation (400)
  MESSAGE_REQUIRED: {
    title: "Paste a message first",
    message: "Add the collaboration message you want checked, then select Analyze message.",
    field: true
  },
  EMPTY_MESSAGE: {
    title: "The message is empty",
    message: "The message only contains spaces or line breaks. Paste the text of the message you received.",
    field: true
  },
  INVALID_MESSAGE_TYPE: {
    title: "The message couldn’t be read",
    message: "Only plain text can be analyzed. Paste the message as text and try again.",
    field: true
  },
  MESSAGE_TOO_LONG: {
    title: "The message is too long",
    message: "Messages can be up to 10,000 characters. Remove signatures or quoted replies and try again.",
    field: true
  },
  INVALID_JSON: {
    title: "The request couldn’t be read",
    message: "The server couldn’t read the request. Try again; if it keeps happening, reload the page.",
    retryable: true
  },

  // Express → analyzer failures
  ANALYZER_TIMEOUT: {
    title: "The analysis took too long",
    message:
      "The analysis service didn’t finish within 60 seconds. Link and domain lookups or the AI model may be slow right now. Try again in a moment.",
    retryable: true
  },
  ANALYZER_UNAVAILABLE: {
    title: "The analysis engine isn’t running",
    message:
      "The API answered, but the analysis engine behind it isn’t reachable. Try again in a few minutes.",
    retryable: true
  },
  ANALYZER_ERROR: {
    title: "The analysis engine hit an error",
    message:
      "The analysis engine couldn’t process this message. Try again; if it fails again, try a shorter version of the message.",
    retryable: true
  },
  INTERNAL_SERVER_ERROR: {
    title: "Something went wrong on the server",
    message: "The server hit an unexpected problem. Try again in a moment.",
    retryable: true
  },

  // Client-side failures
  BACKEND_UNREACHABLE: {
    title: "Can’t reach the Scam Detector API",
    message: `Check your internet connection. If you’re running the app locally, make sure the backend is running at ${API_BASE_URL}.`,
    retryable: true
  },
  CLIENT_TIMEOUT: {
    title: "No response from the server",
    message: "The server didn’t respond in time. Check your connection and try again.",
    retryable: true
  },
  INVALID_RESPONSE: {
    title: "The server sent an unexpected response",
    message:
      "The analysis came back in a format this page can’t read, so no results are shown. Try again; if it persists, the API may have changed.",
    retryable: true
  },
  UNKNOWN: {
    title: "The analysis couldn’t be completed",
    message: "An unexpected error stopped the analysis. Try again.",
    retryable: true
  }
};

export const CANCELLED = "CANCELLED";

export function createApiError(code) {
  const copy = ERROR_COPY[code] ?? ERROR_COPY.UNKNOWN;
  return new ApiError({ code: ERROR_COPY[code] ? code : "UNKNOWN", ...copy });
}

function codeForStatus(status) {
  if (status === 504) return "ANALYZER_TIMEOUT";
  if (status === 503) return "ANALYZER_UNAVAILABLE";
  if (status === 502) return "ANALYZER_ERROR";
  if (status >= 500) return "INTERNAL_SERVER_ERROR";
  return "UNKNOWN";
}

/** Convert anything thrown by Axios (or our own parsing) into an ApiError. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
    return new ApiError({ code: CANCELLED, title: "Cancelled", message: "The analysis was cancelled." });
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return createApiError("CLIENT_TIMEOUT");
  }

  if (error?.response) {
    const backendCode = error.response.data?.error?.code;
    if (typeof backendCode === "string" && ERROR_COPY[backendCode]) {
      return createApiError(backendCode);
    }
    return createApiError(codeForStatus(error.response.status));
  }

  if (error?.request || error?.code === "ERR_NETWORK") {
    return createApiError("BACKEND_UNREACHABLE");
  }

  return createApiError("UNKNOWN");
}
