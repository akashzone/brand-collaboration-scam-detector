import { AlertTriangle, CircleSlash, Info, XCircle } from "lucide-react";

const TONES = {
  error: { icon: XCircle, className: "border-critical-solid bg-critical-tint", iconClass: "text-critical-fg" },
  warning: { icon: AlertTriangle, className: "border-medium-solid bg-medium-tint", iconClass: "text-medium-fg" },
  neutral: { icon: CircleSlash, className: "border-none-solid bg-none-tint", iconClass: "text-none-fg" },
  info: { icon: Info, className: "border-action bg-action-tint", iconClass: "text-action" }
};

/** Inline message block with a left rule. Use `role="alert"` only for errors that interrupt a task. */
export function Alert({ tone = "info", title, children, actions, role, headingLevel = 3, className = "" }) {
  const style = TONES[tone];
  const Icon = style.icon;
  const Heading = `h${headingLevel}`;
  return (
    <div role={role} className={`flex gap-3 rounded-sm border-l-4 px-4 py-3 ${style.className} ${className}`}>
      <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${style.iconClass}`} />
      <div className="min-w-0 flex-1">
        {title ? <Heading className="text-h3 font-semibold text-ink">{title}</Heading> : null}
        {children ? <div className="mt-1 text-sm text-ink-muted">{children}</div> : null}
        {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
