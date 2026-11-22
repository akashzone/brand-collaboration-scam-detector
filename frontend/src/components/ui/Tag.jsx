import { TONE_CLASSES } from "../../utils/risk.js";

/**
 * Small rectangular label: icon + text. The text always carries the meaning,
 * so colour is never the only signal.
 */
export function Tag({ tone = "none", icon: Icon, children, className = "" }) {
  const classes = TONE_CLASSES[tone] ?? TONE_CLASSES.none;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap ${classes.tint} ${classes.fg} ${className}`}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  );
}
