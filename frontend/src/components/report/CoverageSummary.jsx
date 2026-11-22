import { StatusTag } from "../ui/StatusTag.jsx";
import { Alert } from "../ui/Alert.jsx";

/**
 * States plainly whether the report is complete or partial, so a failed
 * component can never pass for a clean result.
 */
export function CoverageSummary({ coverage, warnings }) {
  const partial = coverage.status === "partial";

  return (
    <div className="px-4 pt-5 sm:px-8 sm:pt-6">
      {partial ? (
        <Alert tone="warning" title="Partial report: some checks didn’t complete" headingLevel={3}>
          <p>
            {coverage.incompleteCount === 1 ? "1 check" : `${coverage.incompleteCount} checks`} returned no result or
            only some results. The findings below are incomplete, and a lower score may only mean less was checked.
          </p>
          {warnings.length > 0 ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              {warnings.map((warning) => (
                <li key={`${warning.component}-${warning.domain}-${warning.message}`}>
                  <span className="font-medium text-ink">{warning.component}</span>
                  {warning.domain ? (
                    <>
                      {" "}
                      (<span translate="no" className="evidence">{warning.domain}</span>)
                    </>
                  ) : null}
                  : {warning.message}
                </li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      <ul
        className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line pb-5 sm:grid-cols-4"
        aria-label="Checks in this report"
      >
        {coverage.checks.map((check) => (
          <li key={check.key} className="min-w-0">
            <span className="block text-xs text-ink-muted">{check.label}</span>
            <span className="mt-1 block">
              <StatusTag status={check.status} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
