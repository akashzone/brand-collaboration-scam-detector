/**
 * Mapping from backend risk levels / severities to visual tones.
 * Thresholds mirror analyzer/services/risk_scorer.py → get_risk_level().
 * Class strings are written out in full so Tailwind can detect them.
 */

export const RISK_BANDS = [
  { level: "Low", tone: "low", min: 0, max: 29 },
  { level: "Medium", tone: "medium", min: 30, max: 59 },
  { level: "High", tone: "high", min: 60, max: 79 },
  { level: "Critical", tone: "critical", min: 80, max: 100 }
];

export const TONE_CLASSES = {
  low: {
    fg: "text-low-fg",
    tint: "bg-low-tint",
    solid: "bg-low-solid",
    border: "border-low-solid",
    mark: "bg-mark-low border-low-solid"
  },
  medium: {
    fg: "text-medium-fg",
    tint: "bg-medium-tint",
    solid: "bg-medium-solid",
    border: "border-medium-solid",
    mark: "bg-mark-medium border-medium-solid"
  },
  high: {
    fg: "text-high-fg",
    tint: "bg-high-tint",
    solid: "bg-high-solid",
    border: "border-high-solid",
    mark: "bg-mark-high border-high-solid"
  },
  critical: {
    fg: "text-critical-fg",
    tint: "bg-critical-tint",
    solid: "bg-critical-solid",
    border: "border-critical-solid",
    mark: "bg-mark-high border-critical-solid"
  },
  none: {
    fg: "text-none-fg",
    tint: "bg-none-tint",
    solid: "bg-none-solid",
    border: "border-none-solid",
    mark: "bg-none-tint border-none-solid"
  }
};

/** Tone for a backend riskLevel string ("Low" | "Medium" | "High" | "Critical" | "Unknown"). */
export function toneForRiskLevel(level) {
  const band = RISK_BANDS.find((item) => item.level === level);
  return band ? band.tone : "none";
}

/** Fallback only, used when riskLevel is missing but a numeric score exists. */
export function levelForScore(score) {
  return RISK_BANDS.find((band) => score >= band.min && score <= band.max)?.level ?? "Unknown";
}

/** Normalised severity of a finding: "high" | "medium" | "low" | "none". */
export function severityOf(severity) {
  const value = typeof severity === "string" ? severity.toLowerCase() : "";
  return value === "high" || value === "medium" || value === "low" ? value : "none";
}

/**
 * Visual tone for a finding's severity. Green is reserved for the overall
 * "Low risk" verdict, so a low-severity *finding* (still a concern) is drawn
 * in neutral grey rather than a reassuring green.
 */
export function toneForSeverity(severity) {
  const value = severityOf(severity);
  return value === "low" ? "none" : value;
}

export const SEVERITY_RANK = { high: 3, medium: 2, low: 1, none: 0 };
