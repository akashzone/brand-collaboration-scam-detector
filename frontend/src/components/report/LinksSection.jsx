import { Link2 } from "lucide-react";
import { defangUrl } from "../../utils/defang.js";
import { humanize, pluralize } from "../../utils/formatters.js";
import { Literal } from "../ui/Evidence.jsx";
import { StatusTag } from "../ui/StatusTag.jsx";
import { CheckRow } from "./CheckRow.jsx";
import { ReportSection, UnavailableNotice } from "./ReportSection.jsx";

/*
 * Flag tones follow the analyzer's own URL scoring weights
 * (risk_scorer.calculate_url_component_score): IP-based and brand mismatch
 * carry 30 points (high), shorteners and suspicious patterns 25 (medium),
 * and plain HTTP 10 (low).
 */

function UrlChecks({ item }) {
  return (
    <dl className="divide-y divide-line">
      <CheckRow
        label="Address type"
        flagged={item.ip ? item.ip.isIpBased : null}
        tone="high"
        result={
          item.ip?.isIpBased ? (
            <>
              raw IP address <Literal>{item.ip.address}</Literal>
              {item.ip.version ? ` (IPv${item.ip.version})` : null}
            </>
          ) : item.ip ? (
            "uses a domain name, not a raw IP address"
          ) : null
        }
      />
      <CheckRow
        label="Link shortener"
        flagged={item.shortener ? item.shortener.isShortened : null}
        tone="medium"
        result={
          item.shortener?.isShortened ? (
            <>
              shortened with <Literal>{item.shortener.domain}</Literal>, which hides the real destination
            </>
          ) : item.shortener ? (
            "not a known shortener"
          ) : null
        }
      />
      <CheckRow
        label="Address patterns"
        flagged={item.patterns ? item.patterns.isSuspicious : null}
        tone="medium"
        result={
          item.patterns?.isSuspicious
            ? pluralize(item.patterns.findings.length, "suspicious pattern")
            : item.patterns
              ? "no suspicious patterns found"
              : null
        }
      >
        {item.patterns?.isSuspicious ? (
          <ul className="space-y-2">
            {item.patterns.findings.map((finding, index) => (
              <li key={`${finding.type}-${index}`} className="text-sm">
                <span className="text-ink">{finding.description ?? humanize(finding.type)}</span>
                {finding.evidence.length > 0 ? (
                  <span className="mt-0.5 block">
                    {finding.evidence.map((value) => (
                      <Literal key={value} className="mr-2 rounded-xs bg-medium-tint px-1">
                        {value}
                      </Literal>
                    ))}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </CheckRow>
      <CheckRow
        label="Connection"
        flagged={item.https ? !item.https.isHttps : null}
        tone="low"
        result={
          item.https
            ? item.https.isHttps
              ? "HTTPS. This only means the connection is encrypted; scam sites use HTTPS too."
              : `unencrypted ${item.https.protocol?.toUpperCase() ?? "HTTP"}`
            : null
        }
      />
      {item.brand ? (
        <CheckRow
          label="Brand match"
          flagged={item.brand.isPotentialImpersonation}
          tone="high"
          result={
            item.brand.isPotentialImpersonation
              ? `may impersonate ${item.brand.brand ?? "a brand"}`
              : item.brand.isOfficialDomain
                ? `an official ${item.brand.brand ?? "brand"} domain`
                : humanize(item.brand.finding) || "no impersonation detected"
          }
        />
      ) : null}
    </dl>
  );
}

function UrlItem({ item }) {
  const shown = item.url ?? item.normalizedUrl ?? "";
  const showNormalized = item.normalizedUrl && item.normalizedUrl !== item.url;
  const itemStatus = item.status === "completed" ? "complete" : "unavailable";

  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="flex min-w-0 items-start gap-2">
          <Link2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
          <span className="sr-only">Link (shown defanged so it can’t be opened): </span>
          <Literal className="font-medium">{defangUrl(shown)}</Literal>
        </p>
        <StatusTag
          status={itemStatus}
          label={item.status === "invalid" ? "Couldn’t be parsed" : item.status === "completed" ? "Checked" : undefined}
        />
      </div>
      {showNormalized ? (
        <p className="mt-1 pl-6 text-xs text-ink-subtle">
          Normalized as <Literal className="text-xs text-ink-muted">{defangUrl(item.normalizedUrl)}</Literal>
        </p>
      ) : null}

      <div className="mt-3 sm:pl-6">
        {item.status === "completed" ? (
          <UrlChecks item={item} />
        ) : (
          <UnavailableNotice title={item.status === "invalid" ? "This link couldn’t be read as a valid web address" : "This link wasn’t checked"}>
            It wasn’t analyzed and isn’t part of the score. Treat it with the same caution as any unverified link.
          </UnavailableNotice>
        )}
      </div>
    </li>
  );
}

export function LinksSection({ urls }) {
  const description =
    "Each link is checked for raw IP addresses, shorteners, deceptive address patterns, and connection type. Links are shown defanged (hxxp, [.]) so they can’t be opened by accident.";

  return (
    <ReportSection id="links" title="Links" description={description} status={urls.status}>
      {urls.status === "not_applicable" ? (
        <p className="text-sm text-ink-muted">No links were found in the message, so there was nothing to check.</p>
      ) : urls.items.length === 0 ? (
        <UnavailableNotice title="Link analysis didn’t return results">
          Any links in the message weren’t checked. Don’t assume they’re safe.
        </UnavailableNotice>
      ) : (
        <ul className="divide-y divide-line">
          {urls.items.map((item, index) => (
            <UrlItem key={`${item.url}-${index}`} item={item} />
          ))}
        </ul>
      )}
    </ReportSection>
  );
}
