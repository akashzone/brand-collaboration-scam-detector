import { useEffect, useState } from "react";

/** Whole seconds elapsed since `startedAt` (ms timestamp), updated once per second. */
export function useElapsedSeconds(startedAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
}
