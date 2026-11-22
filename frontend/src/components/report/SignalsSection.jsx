import { ShieldAlert, ShieldQuestion } from "lucide-react";
import { humanize, pluralize } from "../../utils/formatters.js";
import { SEVERITY_RANK, TONE_CLASSES, severityOf, toneForSeverity } from "../../utils/risk.js";
import { EvidenceMark, Literal } from "../ui/Evidence.jsx";
import { SeverityTag } from "../ui/SeverityTag.jsx";
import { Tag } from "../ui/Tag.jsx";
import { ReportSection, UnavailableNotice } from "./ReportSection.jsx";

function SeverityCounts({ counts }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Matches by severity">
      {["high", "medium", "low"].map((severity) => (
        <li key={severity}>
          <Tag tone={counts[severity] > 0 ? toneForSeverity(severity) : "none"}>
            <span className="tabular">{counts[severity]}</span> {humanize(severity)}
          </Tag>
        </li>
      ))}
    </ul>
  );
}

function IndicatorItem({ indicator }) {
  const tone = toneForSeverity(indicator.severity);
  return (
    <li className={`border-l-2 pl-4 ${TONE_CLASSES[tone].border}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-h3 font-semibold text-ink">
          {humanize(indicator.category) || humanize(indicator.id) || "Matched pattern"}
        </h3>
        <SeverityTag severity={indicator.severity} />
      </div>
      {indicator.description ? (
        <p className="mt-1 max-w-prose text-sm text-ink-muted">{indicator.description}</p>
      ) : null}
      {indicator.evidence.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-2">
          <span className="text-xs text-ink-subtle">Matched text:</span>
          {indicator.evidence.map((phrase) => (
            <EvidenceMark key={phrase} severity={indicator.severity}>
              {phrase}
            </EvidenceMark>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function BrandChecks({ checks }) {
  if (checks.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-h3 font-semibold text-ink">Brand and domain mentions</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Brands named in the message, compared with the domains that brand officially uses.
      </p>
      <ul className="mt-3 divide-y divide-line rounded-sm border border-line">
        {checks.map((check, index) => (
          <li key={`${check.brand}-${check.domain}-${index}`} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-sm font-medium text-ink">{check.brand ?? "Unknown brand"}</span>
              {check.domain ? <Literal>{check.domain}</Literal> : null}
              {check.matchesOfficialDomain === false ? (
                <Tag tone="critical" icon={ShieldAlert}>
                  Not an official domain
                </Tag>
              ) : check.matchesOfficialDomain === true ? (
                <Tag tone="none">Matches an official domain</Tag>
              ) : (
                <Tag tone="none" icon={ShieldQuestion}>
                  Not determined
                </Tag>
              )}
            </div>
            {check.matchesOfficialDomain === false && check.expectedDomains.length > 0 ? (
              <p className="mt-1.5 text-sm text-ink-muted">
                Official domains:{" "}
                {check.expectedDomains.map((domain, i) => (
                  <span key={domain}>
                    {i > 0 ? ", " : null}
                    <Literal>{domain}</Literal>
                  </span>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactDetails({ urls, emails }) {
  if (urls.length === 0 && emails.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-h3 font-semibold text-ink">Contact details found</h3>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
        <dt className="text-ink-muted">Links</dt>
        <dd>{urls.length > 0 ? `${pluralize(urls.length, "link")}, checked in Links below` : "None"}</dd>
        <dt className="text-ink-muted">Email addresses</dt>
        <dd className="min-w-0">
          {emails.length > 0 ? (
            <ul className="space-y-1">
              {emails.map((email) => (
                <li key={email}>
                  <Literal>{email}</Literal>
                </li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </dd>
      </dl>
    </div>
  );
}

export function SignalsSection({ text }) {
  const description =
    "Rule-based checks for common scam tactics: payment requests, login requests, pressure, and moving off-platform.";

  if (text.status !== "complete") {
    return (
      <ReportSection id="signals" title="Message wording" description={description} status={text.status}>
        <UnavailableNotice title="The wording check didn’t return results">
          Pattern matching on the message text is unavailable for this report, so it isn’t reflected below or in
          the score.
        </UnavailableNotice>
      </ReportSection>
    );
  }

  const indicators = [...text.indicators].sort(
    (a, b) => SEVERITY_RANK[severityOf(b.severity)] - SEVERITY_RANK[severityOf(a.severity)]
  );

  return (
    <ReportSection id="signals" title="Message wording" description={description} status={text.status}>
      {text.summary ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            <span className="font-medium">{pluralize(text.summary.total, "pattern")} matched.</span>
            {text.summary.classification ? (
              <span className="text-ink-muted"> Wording risk: {text.summary.classification}</span>
            ) : null}
          </p>
          <SeverityCounts counts={text.summary.counts} />
        </div>
      ) : null}

      {indicators.length > 0 ? (
        <ul className="mt-6 space-y-6">
          {indicators.map((indicator, index) => (
            <IndicatorItem key={indicator.id ?? index} indicator={indicator} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 max-w-prose text-sm text-ink-muted">
          No known scam phrases were found in the wording. These rules only catch common tactics, so read the AI
          assessment below and verify the sender before you act.
        </p>
      )}

      <BrandChecks checks={text.brandChecks} />
      <ContactDetails urls={text.urls} emails={text.emails} />
    </ReportSection>
  );
}
