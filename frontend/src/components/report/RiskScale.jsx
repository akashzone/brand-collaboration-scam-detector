import { RISK_BANDS, TONE_CLASSES } from "../../utils/risk.js";

/**
 * A 0–100 track split at the analyzer's real thresholds (30 / 60 / 80), with
 * a marker at the returned score. It shows where the score sits, not just
 * its value.
 */
export function RiskScale({ score, level }) {
  const position = Math.min(100, Math.max(0, score));
  const band = RISK_BANDS.find((item) => item.level === level);
  const description = band
    ? `Score ${score} out of 100, in the ${band.level} band (${band.min} to ${band.max}).`
    : `Score ${score} out of 100.`;

  return (
    <div role="img" aria-label={description} className="w-full">
      <div className="relative pt-3.5">
        <div
          className="absolute top-0 -translate-x-1/2"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 12 8" className="block h-2 w-3 fill-ink">
            <path d="M0 0h12L6 8z" />
          </svg>
        </div>
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-xs" aria-hidden="true">
          {RISK_BANDS.map((item) => (
            <div
              key={item.level}
              style={{ flexGrow: item.max - item.min + 1, flexBasis: 0 }}
              className={`${TONE_CLASSES[item.tone].solid} ${item.level === level ? "" : "opacity-30"}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex gap-0.5 text-xs" aria-hidden="true">
        {RISK_BANDS.map((item) => (
          <div key={item.level} style={{ flexGrow: item.max - item.min + 1, flexBasis: 0 }} className="min-w-0">
            <span
              className={
                item.level === level ? `font-semibold ${TONE_CLASSES[item.tone].fg}` : "text-ink-subtle"
              }
            >
              {item.level}
            </span>
            <span className="tabular hidden text-ink-subtle sm:inline"> {item.min}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
