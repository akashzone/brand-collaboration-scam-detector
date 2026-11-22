import { RefreshCw } from "lucide-react";

const COPY = {
  checking: { label: "Checking API…", dot: "bg-band-muted" },
  online: { label: "API online", dot: "bg-low-solid" },
  offline: { label: "API offline", dot: "bg-critical-solid" }
};

/** Live result of GET /api/health. It reflects the Express API only, not the analyzer behind it. */
export function ApiStatus({ status, onRecheck }) {
  const copy = COPY[status] ?? COPY.checking;
  return (
    <div className="flex items-center gap-1">
      <p className="flex items-center gap-2 text-xs text-band-fg" role="status" aria-live="polite">
        <span aria-hidden="true" className={`size-2 rounded-full ${copy.dot}`} />
        {copy.label}
      </p>
      {status === "offline" ? (
        <button
          type="button"
          onClick={onRecheck}
          aria-label="Check API status again"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-sm text-band-muted hover:text-white focus-visible:outline-white"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
