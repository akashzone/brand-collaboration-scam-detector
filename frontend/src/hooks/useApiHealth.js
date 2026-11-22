import { useCallback, useEffect, useRef, useState } from "react";
import { checkHealth } from "../services/analyzeService.js";

/** Tracks GET /api/health. Status: "checking" | "online" | "offline". */
export function useApiHealth() {
  const [status, setStatus] = useState("checking");
  const controllerRef = useRef(null);

  const recheck = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("checking");
    const healthy = await checkHealth({ signal: controller.signal });
    if (!controller.signal.aborted) setStatus(healthy ? "online" : "offline");
  }, []);

  useEffect(() => {
    recheck();
    return () => controllerRef.current?.abort();
  }, [recheck]);

  return { status, recheck };
}
