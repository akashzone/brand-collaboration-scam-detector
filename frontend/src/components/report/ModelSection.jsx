import { CircleCheck, OctagonAlert, Info, TriangleAlert } from "lucide-react";
import { toneForSeverity } from "../../utils/risk.js";
import { Tag } from "../ui/Tag.jsx";
import { ReportSection, UnavailableNotice } from "./ReportSection.jsx";

const LIKELIHOOD_ICON = { high: OctagonAlert, medium: TriangleAlert, low: Info, none: Info };
const LIKELIHOOD_LABEL = { high: "High", medium: "Medium", low: "Low", none: "Not stated" };

/*
 * AI findings use the same neutral type and colours as rule-based ones. They
 * are told apart by a dashed rule and an explicit source label, so neither
 * looks more authoritative than the other.
 */
export function ModelSection({ llm }) {
  const description =
    "Google Gemini reads the whole message for context the pattern rules can’t see. AI can misread tone or invent concerns, so weigh it alongside the other checks.";

  if (llm.status !== "complete") {
    return (
      <ReportSection id="model" title="AI assessment" description={description} status={llm.status}>
        <UnavailableNotice title="The AI assessment didn’t run for this report">
          {llm.reason ?? "The Gemini service was unavailable."} The overall score was calculated without it, so it
          rests on fewer signals than usual.
        </UnavailableNotice>
      </ReportSection>
    );
  }

  const tone = toneForSeverity(llm.likelihood);
  const LikelihoodIcon = LIKELIHOOD_ICON[tone];

  return (
    <ReportSection id="model" title="AI assessment" description={description} status={llm.status}>
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <dt className="text-xs text-ink-subtle">Scam likelihood</dt>
          <dd className="mt-1">
            <Tag tone={tone} icon={LikelihoodIcon}>
              {LIKELIHOOD_LABEL[tone]}
            </Tag>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-subtle">AI risk score</dt>
          <dd className="tabular mt-0.5 text-h3 font-semibold text-ink">
            {llm.score ?? "Not provided"}
            {llm.score !== null ? <span className="text-sm font-normal text-ink-subtle"> / 100</span> : null}
          </dd>
        </div>
      </dl>

      {llm.summary ? (
        <blockquote className="mt-5 max-w-prose border-l-2 border-dashed border-ink-subtle pl-4 text-body text-ink">
          {llm.summary}
        </blockquote>
      ) : null}

      {llm.indicators.length > 0 ? (
        <div className="mt-7">
          <h3 className="text-h3 font-semibold text-ink">What the AI flagged</h3>
          <ul className="mt-3 space-y-5">
            {llm.indicators.map((indicator, index) => (
              <li key={`${indicator.category}-${index}`} className="border-l-2 border-dashed border-line-strong pl-4">
                <p className="text-sm font-semibold text-ink">{indicator.category ?? "Concern"}</p>
                {indicator.evidence ? (
                  <p className="mt-1.5 text-sm">
                    <span className="text-xs text-ink-subtle">Quoted: </span>
                    <q translate="no" className="evidence rounded-xs bg-sunken px-1 py-px text-ink">
                      {indicator.evidence}
                    </q>
                  </p>
                ) : null}
                {indicator.explanation ? (
                  <p className="mt-1.5 max-w-prose text-sm text-ink-muted">{indicator.explanation}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">The AI didn’t identify specific concerns in this message.</p>
      )}

      {llm.actions.length > 0 ? (
        <div className="mt-7 rounded-sm bg-sunken px-4 py-4 sm:px-5">
          <h3 className="text-h3 font-semibold text-ink">Recommended next steps</h3>
          <ul className="mt-3 space-y-2.5">
            {llm.actions.map((action) => (
              <li key={action} className="flex gap-2.5 text-sm text-ink">
                <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-action" />
                <span className="max-w-prose">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ReportSection>
  );
}
