import { Globe } from "lucide-react";
import { formatDate, formatDomainAge, humanize } from "../../utils/formatters.js";
import { TONE_CLASSES, toneForSeverity } from "../../utils/risk.js";
import { Literal } from "../ui/Evidence.jsx";
import { SeverityTag } from "../ui/SeverityTag.jsx";
import { StatusTag } from "../ui/StatusTag.jsx";
import { Tag } from "../ui/Tag.jsx";
import { ReportSection, UnavailableNotice } from "./ReportSection.jsx";

const NOT_PROVIDED = <span className="text-ink-subtle">Not provided</span>;

const AGE_WARNING = {
  high: { tone: "high", label: "Registered under 30 days ago" },
  medium: { tone: "medium", label: "Registered under 90 days ago" },
  low: { tone: "none", label: "Registered under a year ago" }
};

/** Why a lookup didn't produce data, phrased so a missing record never reads as "clean". */
const NOT_COMPLETED_COPY = {
  not_found: {
    title: "No public registration record was found",
    body: "This isn’t a sign the domain is safe. Very new domains, some country registries, and domains that don’t exist can all lack a public RDAP record."
  },
  rate_limited: {
    title: "The registration lookup was rate-limited",
    body: "The public RDAP service refused more requests for now, so this domain wasn’t checked. Analyze again later to fill this in."
  },
  invalid_domain: {
    title: "This couldn’t be read as a valid domain",
    body: "The address didn’t contain a domain that can be looked up."
  },
  unavailable: {
    title: "The registration lookup was unavailable",
    body: "The RDAP service couldn’t be reached or returned unusable data, so this domain wasn’t checked."
  }
};

function DomainFacts({ item }) {
  const reg = item.registration;
  const warning = item.age ? AGE_WARNING[item.age.warningLevel] : null;
  const age = item.age ? formatDomainAge(item.age.days, item.age.years) : null;

  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <div>
        <dt className="text-xs text-ink-subtle">Domain age</dt>
        <dd className="mt-0.5 text-sm text-ink">
          <span className="tabular font-medium">{age ?? NOT_PROVIDED}</span>
          {warning ? (
            <span className="mt-1 block">
              <Tag tone={warning.tone}>{warning.label}</Tag>
            </span>
          ) : null}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-ink-subtle">Registered</dt>
        <dd className="mt-0.5 text-sm text-ink">{formatDate(reg.registrationDate) ?? NOT_PROVIDED}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-subtle">Expires</dt>
        <dd className="mt-0.5 text-sm text-ink">{formatDate(reg.expirationDate) ?? NOT_PROVIDED}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-subtle">Last updated</dt>
        <dd className="mt-0.5 text-sm text-ink">{formatDate(reg.lastUpdated) ?? NOT_PROVIDED}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-subtle">Registrar</dt>
        <dd className="mt-0.5 text-sm text-ink">{reg.registrar ?? NOT_PROVIDED}</dd>
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-ink-subtle">Registry status</dt>
        <dd className="mt-0.5 text-sm">
          {reg.domainStatus.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {reg.domainStatus.map((status) => (
                <li key={status}>
                  <Literal className="rounded-xs bg-sunken px-1.5 py-0.5 text-xs text-ink-muted">{status}</Literal>
                </li>
              ))}
            </ul>
          ) : (
            NOT_PROVIDED
          )}
        </dd>
      </div>
    </dl>
  );
}

function DomainItem({ item }) {
  const completed = item.status === "completed";
  const copy = NOT_COMPLETED_COPY[item.status] ?? NOT_COMPLETED_COPY.unavailable;

  return (
    <li className="py-6 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 className="flex min-w-0 items-start gap-2 text-h3 font-semibold">
          <Globe aria-hidden="true" className="mt-1 size-4 shrink-0 text-ink-subtle" />
          <Literal className="text-body font-medium">{item.domain ?? "Unknown domain"}</Literal>
        </h3>
        <StatusTag
          status={completed ? "complete" : "unavailable"}
          label={completed ? "Looked up" : item.status === "not_found" ? "No record" : undefined}
        />
      </div>

      <div className="mt-4 sm:pl-6">
        {completed && item.registration ? (
          <>
            <DomainFacts item={item} />

            {item.indicators.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {item.indicators.map((indicator, index) => (
                  <li
                    key={`${indicator.type}-${index}`}
                    className={`border-l-2 pl-4 ${TONE_CLASSES[toneForSeverity(indicator.severity)].border}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{humanize(indicator.type) || "Domain finding"}</p>
                      <SeverityTag severity={indicator.severity} />
                    </div>
                    {indicator.evidence ? <p className="mt-1 text-sm text-ink">{indicator.evidence}</p> : null}
                    {indicator.explanation ? (
                      <p className="mt-0.5 max-w-prose text-sm text-ink-muted">{indicator.explanation}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-ink-muted">
                No registration red flags were found. An older, active registration doesn’t make a sender trustworthy;
                established domains can still be used in scams.
              </p>
            )}

            {item.dataQualityWarnings.length > 0 ? (
              <div className="mt-5 rounded-sm bg-sunken px-4 py-3">
                <p className="text-sm font-medium text-ink">Incomplete registration data</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
                  {item.dataQualityWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <UnavailableNotice title={copy.title}>
            {copy.body}
            {item.message && item.status !== "not_found" ? ` Details: ${item.message}` : ""}
          </UnavailableNotice>
        )}
      </div>
    </li>
  );
}

export function DomainSection({ domains }) {
  const description =
    "Public registration records (RDAP) for each domain linked in the message. Scam sites are often only days or weeks old. This section isn’t part of the score.";

  return (
    <ReportSection id="domains" title="Domain registration" description={description} status={domains.status}>
      {domains.status === "not_applicable" ? (
        <p className="text-sm text-ink-muted">The message had no linked domains to look up.</p>
      ) : domains.items.length === 0 ? (
        <UnavailableNotice title="Domain lookups didn’t return results">
          Registration data for the linked domains is unavailable for this report.
        </UnavailableNotice>
      ) : (
        <ul className="divide-y divide-line">
          {domains.items.map((item, index) => (
            <DomainItem key={`${item.domain}-${index}`} item={item} />
          ))}
        </ul>
      )}
    </ReportSection>
  );
}
