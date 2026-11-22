import { CheckCircle2, CircleDashed, CircleSlash, MinusCircle } from "lucide-react";
import { STATUS } from "../../utils/report.js";

/*
 * Section status. "Complete" is deliberately neutral ink rather than green:
 * a check that ran is not the same as a check that found nothing.
 */
const STATUS_STYLE = {
  [STATUS.COMPLETE]: { label: "Complete", icon: CheckCircle2, className: "bg-sunken text-ink border-line" },
  [STATUS.PARTIAL]: { label: "Partial", icon: CircleDashed, className: "bg-medium-tint text-medium-fg border-transparent" },
  [STATUS.UNAVAILABLE]: { label: "Unavailable", icon: CircleSlash, className: "bg-none-tint text-none-fg border-transparent" },
  [STATUS.NOT_APPLICABLE]: { label: "Not applicable", icon: MinusCircle, className: "bg-sunken text-ink-muted border-line" }
};

export function StatusTag({ status, label }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE[STATUS.UNAVAILABLE];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label ?? style.label}
    </span>
  );
}
