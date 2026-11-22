/**
 * Turns the raw POST /api/analyze payload into a view model for the report.
 *
 * Every field is read defensively: a missing or malformed component becomes
 * "unavailable". It is never filled with a default that could look like a
 * clean result.
 *
 * Section status values:
 *   complete       – the check ran and returned usable data
 *   partial        – some items ran, some did not
 *   unavailable    – the check did not run or returned unusable data
 *   not_applicable – nothing to check (e.g. no links in the message)
 */
import { asArray, asObject, asStringArray, isNonEmptyString, isNumber, isObject } from "./guards.js";
import { levelForScore, toneForRiskLevel } from "./risk.js";

export const STATUS = {
  COMPLETE: "complete",
  PARTIAL: "partial",
  UNAVAILABLE: "unavailable",
  NOT_APPLICABLE: "not_applicable"
};

/* ---------- Text analysis ---------- */

function buildTextSection(textAnalysis, textSummary) {
  if (!isObject(textAnalysis) || !Array.isArray(textAnalysis.indicators)) {
    return { status: STATUS.UNAVAILABLE };
  }

  const indicators = textAnalysis.indicators.filter(isObject).map((indicator) => ({
    id: isNonEmptyString(indicator.id) ? indicator.id : null,
    category: isNonEmptyString(indicator.category) ? indicator.category : null,
    severity: isNonEmptyString(indicator.severity) ? indicator.severity.toLowerCase() : null,
    description: isNonEmptyString(indicator.description) ? indicator.description : null,
    evidence: asStringArray(indicator.evidence)
  }));

  const entities = asObject(textAnalysis.entities);
  const summary = isObject(textSummary) ? textSummary : null;
  const counts = asObject(summary?.severityCounts);

  return {
    status: STATUS.COMPLETE,
    indicators,
    summary: summary && {
      total: isNumber(summary.totalIndicators) ? summary.totalIndicators : indicators.length,
      counts: {
        high: isNumber(counts.high) ? counts.high : 0,
        medium: isNumber(counts.medium) ? counts.medium : 0,
        low: isNumber(counts.low) ? counts.low : 0
      },
      classification: isNonEmptyString(summary.classification) ? summary.classification : null,
      explanation: isNonEmptyString(summary.explanation) ? summary.explanation : null
    },
    urls: asStringArray(entities.urls),
    emails: asStringArray(entities.emailAddresses),
    brandChecks: asArray(textAnalysis.brandDomainChecks)
      .filter(isObject)
      .map((check) => ({
        brand: isNonEmptyString(check.brand) ? check.brand : null,
        domain: isNonEmptyString(check.domain) ? check.domain : null,
        matchesOfficialDomain:
          typeof check.matchesOfficialDomain === "boolean" ? check.matchesOfficialDomain : null,
        expectedDomains: asStringArray(check.expectedDomains)
      }))
  };
}

/* ---------- URL analysis ---------- */

function buildUrlItem(raw) {
  const ok = raw.status === "analysis_completed";
  const ip = asObject(raw.ipAnalysis);
  const shortener = asObject(raw.shortenerAnalysis);
  const patterns = asObject(raw.suspiciousPatterns);
  const https = asObject(raw.httpsAnalysis);
  const brand = isObject(raw.brandAnalysis) ? raw.brandAnalysis : null;

  return {
    url: isNonEmptyString(raw.url) ? raw.url : null,
    normalizedUrl: isNonEmptyString(raw.normalizedUrl) ? raw.normalizedUrl : null,
    status: ok ? "completed" : raw.status === "invalid_url" ? "invalid" : "unavailable",
    ip: typeof ip.isIpBased === "boolean"
      ? { isIpBased: ip.isIpBased, address: ip.ipAddress ?? null, version: ip.ipVersion ?? null }
      : null,
    shortener: typeof shortener.isShortened === "boolean"
      ? { isShortened: shortener.isShortened, domain: shortener.shortenerDomain ?? null }
      : null,
    patterns: typeof patterns.isSuspicious === "boolean"
      ? {
          isSuspicious: patterns.isSuspicious,
          findings: asArray(patterns.findings).filter(isObject).map((finding) => ({
            type: finding.type ?? null,
            description: isNonEmptyString(finding.description) ? finding.description : null,
            evidence: Array.isArray(finding.evidence)
              ? asStringArray(finding.evidence)
              : asStringArray([finding.evidence])
          }))
        }
      : null,
    https: typeof https.isHttps === "boolean"
      ? { isHttps: https.isHttps, protocol: https.protocol ?? null }
      : null,
    brand: brand && {
      brand: brand.brand ?? null,
      domain: brand.domain ?? null,
      isOfficialDomain: brand.isOfficialDomain === true,
      isPotentialImpersonation: brand.isPotentialImpersonation === true,
      finding: brand.finding ?? null
    }
  };
}

function rollUp(items, isDone) {
  if (items.length === 0) return STATUS.NOT_APPLICABLE;
  const done = items.filter(isDone).length;
  if (done === items.length) return STATUS.COMPLETE;
  if (done === 0) return STATUS.UNAVAILABLE;
  return STATUS.PARTIAL;
}

function buildUrlSection(urlAnalysis) {
  if (!Array.isArray(urlAnalysis)) return { status: STATUS.UNAVAILABLE, items: [] };
  const items = urlAnalysis.filter(isObject).map(buildUrlItem);
  return { status: rollUp(items, (item) => item.status === "completed"), items };
}

/* ---------- Domain intelligence ---------- */

function buildDomainItem(raw) {
  const status = isNonEmptyString(raw.status) ? raw.status : "unavailable";
  const info = asObject(raw.registrationInfo);
  const age = asObject(raw.ageAnalysis);

  return {
    domain: isNonEmptyString(raw.domain) ? raw.domain : null,
    status,
    message: isNonEmptyString(raw.message) ? raw.message : null,
    registration: status === "completed"
      ? {
          registrationDate: info.registrationDate ?? null,
          expirationDate: info.expirationDate ?? null,
          lastUpdated: info.lastUpdated ?? null,
          registrar: isNonEmptyString(info.registrar) ? info.registrar : null,
          domainStatus: asStringArray(info.domainStatus)
        }
      : null,
    age: age.status === "completed"
      ? {
          days: isNumber(age.ageDays) ? age.ageDays : null,
          years: isNumber(age.ageYears) ? age.ageYears : null,
          warningLevel: isNonEmptyString(age.warningLevel) ? age.warningLevel : "unknown"
        }
      : null,
    ageMessage: isNonEmptyString(age.message) ? age.message : null,
    indicators: asArray(raw.indicators).filter(isObject).map((indicator) => ({
      type: indicator.type ?? null,
      severity: isNonEmptyString(indicator.severity) ? indicator.severity.toLowerCase() : null,
      evidence: isNonEmptyString(indicator.evidence) ? indicator.evidence : null,
      explanation: isNonEmptyString(indicator.explanation) ? indicator.explanation : null
    })),
    dataQualityWarnings: asStringArray(raw.dataQualityWarnings)
  };
}

function buildDomainSection(domainAnalysis) {
  if (!Array.isArray(domainAnalysis)) return { status: STATUS.UNAVAILABLE, items: [] };
  const items = domainAnalysis.filter(isObject).map(buildDomainItem);
  return { status: rollUp(items, (item) => item.status === "completed"), items };
}

/* ---------- LLM (Gemini) ---------- */

function buildLlmSection(llmAnalysis) {
  const llm = asObject(llmAnalysis);
  const data = llm.status === "completed" && isObject(llm.data) ? llm.data : null;

  if (!data) {
    return {
      status: STATUS.UNAVAILABLE,
      reason: isNonEmptyString(llm.message) ? llm.message : null
    };
  }

  return {
    status: STATUS.COMPLETE,
    likelihood: isNonEmptyString(data.scam_likelihood) ? data.scam_likelihood.toLowerCase() : null,
    score: isNumber(data.risk_score) ? data.risk_score : null,
    summary: isNonEmptyString(data.summary) ? data.summary : null,
    indicators: asArray(data.indicators).filter(isObject).map((indicator) => ({
      category: isNonEmptyString(indicator.category) ? indicator.category : null,
      evidence: isNonEmptyString(indicator.evidence) ? indicator.evidence : null,
      explanation: isNonEmptyString(indicator.explanation) ? indicator.explanation : null
    })),
    actions: asStringArray(data.recommended_actions)
  };
}

/* ---------- Risk assessment ---------- */

const COMPONENTS = [
  { key: "text", label: "Message wording" },
  { key: "url", label: "Links" },
  { key: "llm", label: "AI assessment (Gemini)" }
];

function buildRiskSection(riskAssessment, sections) {
  const risk = asObject(riskAssessment);
  const score = isNumber(risk.riskScore) ? risk.riskScore : null;

  if (score === null) {
    return {
      status: STATUS.UNAVAILABLE,
      reason: isNonEmptyString(risk.message) ? risk.message : null
    };
  }

  const level = isNonEmptyString(risk.riskLevel) && risk.riskLevel !== "Unknown"
    ? risk.riskLevel
    : levelForScore(score);
  const scores = asObject(risk.componentScores);

  const components = COMPONENTS.map(({ key, label }) => {
    if (isNumber(scores[key])) return { key, label, score: scores[key], reason: null };
    // Explain *why* a component is missing, without inventing a value.
    if (key === "url" && sections.urls.status === STATUS.NOT_APPLICABLE) {
      return { key, label, score: null, reason: "No links in the message" };
    }
    return { key, label, score: null, reason: "Unavailable, so not included" };
  });

  const missing = components.filter(
    (component) => component.score === null && component.reason !== "No links in the message"
  );

  return {
    status: missing.length > 0 ? STATUS.PARTIAL : STATUS.COMPLETE,
    score,
    level,
    tone: toneForRiskLevel(level),
    classification: isNonEmptyString(risk.classification) ? risk.classification : null,
    components
  };
}

/* ---------- Coverage ---------- */

function buildCoverage(sections) {
  const checks = [
    { key: "text", label: "Message wording", status: sections.text.status },
    { key: "urls", label: "Links", status: sections.urls.status },
    { key: "domains", label: "Domain registration", status: sections.domains.status },
    { key: "llm", label: "AI assessment", status: sections.llm.status }
  ];

  const incomplete = checks.filter(
    (check) => check.status === STATUS.UNAVAILABLE || check.status === STATUS.PARTIAL
  );

  return {
    checks,
    incompleteCount: incomplete.length,
    ranCount: checks.filter((check) => check.status !== STATUS.NOT_APPLICABLE).length,
    status: incomplete.length > 0 ? STATUS.PARTIAL : STATUS.COMPLETE
  };
}

/* ---------- Backend warnings ---------- */

const WARNING_LABELS = {
  llm: "AI assessment",
  domain: "Domain registration",
  url: "Link analysis"
};

function buildWarnings(warnings) {
  const seen = new Set();
  return asArray(warnings)
    .filter(isObject)
    .map((warning) => ({
      component: WARNING_LABELS[warning.component] ?? "Analysis",
      domain: isNonEmptyString(warning.domain) ? warning.domain : null,
      message: isNonEmptyString(warning.message) ? warning.message : "A check was unavailable."
    }))
    .filter((warning) => {
      const key = `${warning.component}|${warning.domain}|${warning.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/* ---------- Entry point ---------- */

export function buildReport({ data, warnings }) {
  const source = asObject(data);
  const sections = {
    text: buildTextSection(source.textAnalysis, source.textSummary),
    urls: buildUrlSection(source.urlAnalysis),
    domains: buildDomainSection(source.domainAnalysis),
    llm: buildLlmSection(source.llmAnalysis)
  };

  return {
    ...sections,
    risk: buildRiskSection(source.riskAssessment, sections),
    coverage: buildCoverage(sections),
    warnings: buildWarnings(warnings)
  };
}
