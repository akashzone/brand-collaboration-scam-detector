import { CircleMinus, Flag } from "lucide-react";
import { TONE_CLASSES } from "../../utils/risk.js";

/**
 * One row of a check table. "Not flagged" is drawn in neutral ink, not
 * green: passing one check is not evidence that something is safe.
 *
 * @param {{ label: string, flagged: boolean | null, tone?: string, result: React.ReactNode, children?: React.ReactNode }} props
 */
export function CheckRow({ label, flagged, tone: requestedTone = "high", result, children }) {
  const isUnknown = flagged === null;
  // Green means "low risk" elsewhere; a flagged finding is never drawn in green.
  const tone = requestedTone === "low" ? "medium" : requestedTone;
  return (
    <div className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0">
        <p className="flex items-start gap-2 text-sm">
          {flagged ? (
            <Flag aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${TONE_CLASSES[tone].fg}`} />
          ) : (
            <CircleMinus aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
          )}
          <span className="min-w-0">
            <span className={`font-medium ${flagged ? TONE_CLASSES[tone].fg : "text-ink"}`}>
              {isUnknown ? "Not checked" : flagged ? "Flagged" : "Not flagged"}
            </span>
            {result ? <span className="text-ink-muted">: {result}</span> : null}
          </span>
        </p>
        {children ? <div className="mt-1.5 pl-6">{children}</div> : null}
      </dd>
    </div>
  );
}
