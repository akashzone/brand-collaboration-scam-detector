/**
 * Locate the analyzer's evidence inside the user's original message so it can
 * be highlighted in place.
 *
 * The rule engine returns the exact matched text (`indicator.evidence`), so a
 * case-insensitive search of the message finds each occurrence. When matches
 * overlap, the higher severity wins. Extracted URLs are marked as "link".
 */
import { SEVERITY_RANK, severityOf } from "./risk.js";

const LINK_RANK = 0.5; // below every severity, above plain text

function findAll(haystackLower, needle) {
  const positions = [];
  const target = needle.toLowerCase();
  if (!target) return positions;
  let index = haystackLower.indexOf(target);
  while (index !== -1) {
    positions.push(index);
    index = haystackLower.indexOf(target, index + target.length);
  }
  return positions;
}

/**
 * @param {string} message
 * @param {{ indicators?: Array, urls?: string[] }} sources
 * @returns {Array<{ text: string, kind: null | "high" | "medium" | "low" | "link", labels: string[] }>}
 */
export function annotateMessage(message, { indicators = [], urls = [] } = {}) {
  if (typeof message !== "string" || message === "") return [];

  const lower = message.toLowerCase();
  const ranges = [];

  for (const indicator of indicators) {
    const kind = severityOf(indicator.severity);
    const label = indicator.description ?? indicator.category ?? "Matched pattern";
    for (const phrase of indicator.evidence ?? []) {
      for (const start of findAll(lower, phrase)) {
        ranges.push({ start, end: start + phrase.length, kind, rank: SEVERITY_RANK[kind] ?? 0, label });
      }
    }
  }

  for (const url of urls) {
    for (const start of findAll(lower, url)) {
      ranges.push({ start, end: start + url.length, kind: "link", rank: LINK_RANK, label: "Link found in the message" });
    }
  }

  if (ranges.length === 0) return [{ text: message, kind: null, labels: [] }];

  // Per-character winner: highest rank wins, and labels are collected.
  const owner = new Array(message.length).fill(null);
  for (const range of ranges) {
    for (let i = range.start; i < range.end; i += 1) {
      const current = owner[i];
      if (!current || range.rank > current.rank) {
        owner[i] = { kind: range.kind, rank: range.rank, labels: new Set([range.label]) };
      } else if (range.rank === current.rank) {
        current.labels.add(range.label);
      }
    }
  }

  // Merge consecutive characters with the same kind into segments.
  const segments = [];
  let start = 0;
  let labels = new Set();
  for (let i = 1; i <= message.length; i += 1) {
    const prev = owner[i - 1];
    prev?.labels.forEach((label) => labels.add(label));
    const next = i < message.length ? owner[i] : undefined;
    const sameKind = next !== undefined && (prev?.kind ?? null) === (next?.kind ?? null);
    if (!sameKind) {
      segments.push({ text: message.slice(start, i), kind: prev?.kind ?? null, labels: [...labels] });
      start = i;
      labels = new Set();
    }
  }
  return segments;
}
