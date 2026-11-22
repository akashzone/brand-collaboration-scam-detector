import { StatusTag } from "../ui/StatusTag.jsx";

/**
 * One section of the report sheet: heading + status, then a body specific to
 * its data. Sections are separated by dividers, not nested in cards.
 */
export function ReportSection({ id, title, description, status, statusLabel, children }) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className="border-t border-line px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id={headingId} className="min-w-0 text-h2 font-semibold text-ink">
          {title}
        </h2>
        {status ? <StatusTag status={status} label={statusLabel} /> : null}
      </div>
      {description ? <p className="mt-1 max-w-prose text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Neutral explanation used whenever a check produced no usable data. */
export function UnavailableNotice({ title, children }) {
  return (
    <div className="rounded-sm border border-dashed border-none-solid bg-none-tint px-4 py-3">
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? <p className="mt-1 text-sm text-ink-muted">{children}</p> : null}
    </div>
  );
}
