import { useMemo } from "react";
import { annotateMessage } from "../../utils/annotate.js";
import { TONE_CLASSES } from "../../utils/risk.js";

const MARK_CLASS = {
  high: TONE_CLASSES.high.mark,
  medium: TONE_CLASSES.medium.mark,
  low: TONE_CLASSES.none.mark,
  none: TONE_CLASSES.none.mark,
  link: "bg-action-tint border-action"
};

const LEGEND = [
  { kind: "high", label: "High-severity match" },
  { kind: "medium", label: "Medium-severity match" },
  { kind: "low", label: "Low-severity match" },
  { kind: "link", label: "Link" }
];

const SR_LABEL = { high: "high severity", medium: "medium severity", low: "low severity", none: "unrated", link: "link" };

/**
 * The user's own message, with the phrases the rule engine matched marked in
 * place. The report's evidence quotes map straight back to these marks.
 */
export function AnnotatedMessage({ message, text }) {
  const segments = useMemo(
    () =>
      annotateMessage(message, {
        indicators: text?.status === "complete" ? text.indicators : [],
        urls: text?.status === "complete" ? text.urls : []
      }),
    [message, text]
  );

  const present = new Set(segments.map((segment) => segment.kind).filter(Boolean));
  const legend = LEGEND.filter((item) => present.has(item.kind));

  return (
    <figure>
      <div
        tabIndex={0}
        role="region"
        aria-label="Analyzed message with matched phrases highlighted"
        className="max-h-[32rem] overflow-y-auto rounded-sm border border-line bg-sunken px-3 py-3 text-body whitespace-pre-wrap text-ink [overflow-wrap:anywhere]"
      >
        {segments.map((segment, index) =>
          segment.kind ? (
            <mark
              // Segments are positional and never reorder, so the index is a stable key.
              key={index}
              title={segment.labels.join("\n")}
              className={`rounded-xs border-b-2 px-0.5 text-ink ${MARK_CLASS[segment.kind]}`}
            >
              {segment.text}
              <span className="sr-only"> ({SR_LABEL[segment.kind]})</span>
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        )}
      </div>
      <figcaption className="mt-3">
        {legend.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted" aria-label="Highlight key">
            {legend.map((item) => (
              <li key={item.kind} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`inline-block h-3 w-4 rounded-xs border-b-2 ${MARK_CLASS[item.kind]}`} />
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-muted">No phrases in this message matched the pattern rules.</p>
        )}
      </figcaption>
    </figure>
  );
}
