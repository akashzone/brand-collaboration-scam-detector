import { TONE_CLASSES, severityOf } from "../../utils/risk.js";

const MARK = { high: TONE_CLASSES.high.mark, medium: TONE_CLASSES.medium.mark, low: TONE_CLASSES.none.mark, none: TONE_CLASSES.none.mark };

/** A literal phrase quoted from the message, highlighted at its severity. */
export function EvidenceMark({ children, severity }) {
  return (
    <mark
      translate="no"
      className={`evidence rounded-xs border-b-2 px-1 py-px text-sm text-ink ${MARK[severityOf(severity)]}`}
    >
      {children}
    </mark>
  );
}

/** Literal machine text (URL, domain, status code), not highlighted. */
export function Literal({ children, className = "" }) {
  return (
    <span translate="no" className={`evidence text-sm text-ink ${className}`}>
      {children}
    </span>
  );
}
