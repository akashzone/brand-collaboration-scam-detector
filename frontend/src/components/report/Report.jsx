import { forwardRef } from "react";
import { Pencil } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { formatTime } from "../../utils/formatters.js";
import { Alert } from "../ui/Alert.jsx";
import { CoverageSummary } from "./CoverageSummary.jsx";
import { DomainSection } from "./DomainSection.jsx";
import { LinksSection } from "./LinksSection.jsx";
import { ModelSection } from "./ModelSection.jsx";
import { RiskSection } from "./RiskSection.jsx";
import { SignalsSection } from "./SignalsSection.jsx";

/** The finished report: one sheet with sections ordered from verdict to detail. */
export const Report = forwardRef(function Report({ report, completedAt, isStale, onCheckAnother }, headingRef) {
  return (
    <article
      aria-labelledby="report-title"
      className="animate-fade-in overflow-hidden rounded-md border border-line bg-surface shadow-sheet"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-5 sm:px-8 sm:pt-6">
        <div className="min-w-0">
          <h2 id="report-title" ref={headingRef} tabIndex={-1} className="text-h2 font-semibold text-ink">
            Scam check report
          </h2>
          {completedAt ? (
            <p className="text-xs text-ink-subtle">
              Analyzed at <time dateTime={completedAt.toISOString()}>{formatTime(completedAt)}</time>
            </p>
          ) : null}
        </div>
        {onCheckAnother ? (
          <Button variant="secondary" icon={Pencil} onClick={onCheckAnother}>
            Check another message
          </Button>
        ) : null}
      </header>

      {isStale ? (
        <div className="px-4 pt-4 sm:px-8">
          <Alert tone="info" title="The message has changed since this report">
            Analyze the message again to update the report.
          </Alert>
        </div>
      ) : null}

      <CoverageSummary coverage={report.coverage} warnings={report.warnings} />
      <RiskSection risk={report.risk} />
      <SignalsSection text={report.text} />
      <LinksSection urls={report.urls} />
      <DomainSection domains={report.domains} />
      <ModelSection llm={report.llm} />
    </article>
  );
});
