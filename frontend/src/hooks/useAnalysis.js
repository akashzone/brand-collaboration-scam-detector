import { useCallback, useEffect, useReducer, useRef } from "react";
import { analyzeMessage } from "../services/analyzeService.js";
import { CANCELLED, toApiError } from "../services/apiErrors.js";
import { buildReport } from "../utils/report.js";

const initialState = {
  status: "idle", // idle | loading | success | error
  report: null,
  error: null,
  analyzedMessage: "",
  completedAt: null,
  startedAt: null
};

function reducer(state, action) {
  switch (action.type) {
    case "start":
      return { ...state, status: "loading", error: null, startedAt: action.startedAt };
    case "success":
      return {
        status: "success",
        report: action.report,
        error: null,
        analyzedMessage: action.message,
        completedAt: action.completedAt,
        startedAt: null
      };
    case "failure":
      return { ...initialState, status: "error", error: action.error };
    case "cancel":
      return { ...initialState };
    default:
      return state;
  }
}

/**
 * Owns one analysis request at a time. Starting a new one aborts the previous
 * request, so a slow response can never overwrite a newer report.
 */
export function useAnalysis() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const analyze = useCallback(async (message) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    dispatch({ type: "start", startedAt: Date.now() });

    try {
      const response = await analyzeMessage(message, { signal: controller.signal });
      if (controller.signal.aborted) return;
      dispatch({
        type: "success",
        report: buildReport(response),
        message,
        completedAt: new Date()
      });
    } catch (thrown) {
      const error = toApiError(thrown);
      if (controller.signal.aborted || error.code === CANCELLED) return;
      dispatch({ type: "failure", error });
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    dispatch({ type: "cancel" });
  }, []);

  return { ...state, analyze, cancel };
}
