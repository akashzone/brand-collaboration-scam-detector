import { BrainCircuit, Globe, Link2, LoaderCircle, MessageSquareText, RotateCcw } from "lucide-react";
import { useElapsedSeconds } from "../../hooks/useElapsedSeconds.js";
import { Alert } from "../ui/Alert.jsx";
import { Button } from "../ui/Button.jsx";

const CHECKS = [
  {
    icon: MessageSquareText,
    title: "Message wording",
    body: "Requests for fees, logins, or account access, pressure tactics, and moving the chat off-platform."
  },
  {
    icon: Link2,
    title: "Links",
    body: "Shorteners, raw IP addresses, deceptive address patterns, and unencrypted connections."
  },
  {
    icon: Globe,
    title: "Domain registration",
    body: "How old each linked domain is, who registered it, and its registry status."
  },
  {
    icon: BrainCircuit,
    title: "AI assessment",
    body: "Google Gemini reads the whole message for context and suggests next steps."
  }
];

function CheckList() {
  return (
    <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {CHECKS.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-3">
          <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <p className="mt-0.5 text-sm text-ink-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Before the first analysis: explains what the report will contain. */
export function EmptyReport() {
  return (
    <div className="rounded-md border border-dashed border-line-strong px-4 py-8 sm:px-8">
      <h2 className="text-h2 font-semibold text-ink">Your report will appear here</h2>
      <p className="mt-1 mb-6 max-w-prose text-sm text-ink-muted">
        Paste a message and select Analyze message. Four checks run on it:
      </p>
      <CheckList />
      <p className="mt-8 max-w-prose border-t border-line pt-4 text-xs text-ink-subtle">
        Your message is sent to the Scam Detector service and to Google Gemini for the AI assessment. This app
        doesn’t save it or keep a history.
      </p>
    </div>
  );
}

function SkeletonBlock({ className }) {
  return <div aria-hidden="true" className={`rounded-xs bg-none-tint ${className}`} />;
}

/**
 * While the request runs. The backend returns everything at once, so there's
 * no per-check progress to show; only real elapsed time is displayed.
 */
export function ReportLoading({ startedAt, headingRef }) {
  const seconds = useElapsedSeconds(startedAt);
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sheet">
      <div className="px-4 py-6 sm:px-8">
        <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-h2 font-semibold text-ink">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-action motion-reduce:hidden" />
          Analyzing the message…
        </h2>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">
          All four checks run together and the report appears when they finish. Link lookups and the AI assessment
          can take up to a minute.
        </p>
        <p className="tabular mt-3 text-xs text-ink-subtle" aria-hidden="true">
          {seconds} s elapsed
        </p>
      </div>
      <div className="space-y-4 border-t border-line px-4 py-6 sm:px-8" aria-hidden="true">
        <div className="flex items-end gap-4">
          <SkeletonBlock className="h-12 w-24" />
          <SkeletonBlock className="h-8 w-28" />
        </div>
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
      {["w-40", "w-28", "w-48"].map((width) => (
        <div key={width} className="space-y-3 border-t border-line px-4 py-6 sm:px-8" aria-hidden="true">
          <SkeletonBlock className={`h-5 ${width}`} />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

/** A request-level failure: nothing was analyzed, so no partial results are shown. */
export function ReportError({ error, onRetry, headingRef }) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-6 shadow-sheet sm:px-8">
      <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-h2 font-semibold text-ink">
        {error.title}
      </h2>
      <Alert
        tone="error"
        role="alert"
        actions={
          error.retryable && onRetry ? (
            <Button variant="secondary" icon={RotateCcw} onClick={onRetry}>
              Try again
            </Button>
          ) : null
        }
      >
        <p>{error.message}</p>
        <p className="mt-2">No checks were completed, so there are no results to show.</p>
      </Alert>
    </div>
  );
}
