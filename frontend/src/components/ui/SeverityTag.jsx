import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { severityOf, toneForSeverity } from "../../utils/risk.js";
import { Tag } from "./Tag.jsx";

const ICONS = { high: AlertOctagon, medium: AlertTriangle, low: Info, none: Info };
const LABELS = { high: "High", medium: "Medium", low: "Low", none: "Unrated" };

export function SeverityTag({ severity, suffix = "severity" }) {
  const level = severityOf(severity);
  return (
    <Tag tone={toneForSeverity(level)} icon={ICONS[level]}>
      {LABELS[level]}
      {suffix ? <span className="sr-only"> {suffix}</span> : null}
    </Tag>
  );
}
