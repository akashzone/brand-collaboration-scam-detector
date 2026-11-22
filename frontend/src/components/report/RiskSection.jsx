import { CircleHelp, OctagonAlert, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { TONE_CLASSES } from "../../utils/risk.js";
import { ComponentScores } from "./ComponentScores.jsx";
import { RiskScale } from "./RiskScale.jsx";
import { UnavailableNotice } from "./ReportSection.jsx";

const LEVEL_ICON = {
  low: ShieldCheck,
  medium: TriangleAlert,
  high: OctagonAlert,
  critical: ShieldAlert,
  none: CircleHelp
};

/*
 * Guidance per level. A low score is never described as "safe": it only
 * means the checks that ran found little.
 */
const GUIDANCE = {
  low: "The checks that ran found few or no scam signals. That isn’t proof the offer is genuine, so still confirm it through the brand’s official website or verified account.",
  medium: "Some signals call for caution. Verify the sender independently before you reply, open links, or share any details.",
  high: "Several strong scam signals were found. Don’t pay fees, share logins, or open the links until you’ve verified the brand directly.",
  critical: "This message matches several serious scam patterns. Don’t pay, share account access, or open its links.",
  none: "The risk level couldn’t be determined from the response."
};

export function RiskSection({ risk }) {
  if (risk.status === "unavailable") {
    return (
      <section aria-labelledby="risk-heading" className="px-4 py-6 sm:px-8 sm:py-8">
        <h2 id="risk-heading" className="text-h2 font-semibold text-ink">
          Overall risk
        </h2>
        <div className="mt-4">
          <UnavailableNotice title="No overall score could be calculated">
            {risk.reason ?? "None of the scoring checks returned usable results."} Review each section below,
            and don’t treat a missing score as a clean result.
          </UnavailableNotice>
        </div>
      </section>
    );
  }

  const tone = TONE_CLASSES[risk.tone];
  const Icon = LEVEL_ICON[risk.tone];

  return (
    <section aria-labelledby="risk-heading" className="px-4 py-6 sm:px-8 sm:py-8">
      <h2 id="risk-heading" className="text-sm font-medium text-ink-muted">
        Overall risk
      </h2>

      <div className="mt-2 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-end md:gap-10">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="tabular text-display font-semibold text-ink">
            {risk.score}
            <span className="text-h2 font-normal text-ink-subtle">/100</span>
          </p>
          <p
            className={`mb-1.5 flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-h3 font-semibold ${tone.tint} ${tone.fg}`}
          >
            <Icon aria-hidden="true" className="size-5" />
            {risk.level} risk
          </p>
        </div>
        <RiskScale score={risk.score} level={risk.level} />
      </div>

      {risk.classification ? (
        <p className="mt-6 text-sm text-ink-muted">
          Classification: <span className="font-medium text-ink">{risk.classification}</span>
        </p>
      ) : null}
      <p className="mt-2 max-w-prose text-body text-ink">{GUIDANCE[risk.tone]}</p>

      <div className="mt-6 rounded-sm bg-sunken px-4 py-4 sm:px-5">
        <h3 className="text-sm font-semibold text-ink">What the score is based on</h3>
        <p className="mt-1 mb-4 max-w-prose text-sm text-ink-muted">
          The overall score combines these checks. A check that didn’t return a result is left out and the
          others are re-weighted. Domain registration data is reported separately and isn’t part of the score.
        </p>
        <ComponentScores components={risk.components} />
      </div>
    </section>
  );
}
