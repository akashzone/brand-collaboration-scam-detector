const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const numberFormatter = new Intl.NumberFormat();

/** Format an ISO date string; returns null when missing or unparseable. */
export function formatDate(value) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

export const formatTime = (date) => timeFormatter.format(date);

export const formatNumber = (value) => numberFormatter.format(value);

/** "financial_request" → "Financial request" */
export function humanize(value) {
  if (typeof value !== "string" || !value) return "";
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/** Domain age in words, from the analyzer's ageDays / ageYears. */
export function formatDomainAge(ageDays, ageYears) {
  if (typeof ageDays !== "number") return null;
  if (ageDays < 1) return "Less than a day";
  if (ageDays < 90) return `${formatNumber(ageDays)} ${ageDays === 1 ? "day" : "days"}`;
  if (typeof ageYears === "number" && ageYears >= 1) {
    const years = Math.floor(ageYears);
    return `${years} ${years === 1 ? "year" : "years"} (${formatNumber(ageDays)} days)`;
  }
  const months = Math.floor(ageDays / 30.44);
  return `${months} months (${formatNumber(ageDays)} days)`;
}

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;
