/** One bar per score component the analyzer actually returned. */
export function ComponentScores({ components }) {
  return (
    <dl className="space-y-3">
      {components.map((component) => (
        <div
          key={component.key}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[12rem_minmax(0,1fr)_2.5rem]"
        >
          <dt className="text-sm text-ink">{component.label}</dt>
          {component.score === null ? (
            <dd className="text-right text-sm text-ink-subtle sm:col-span-2 sm:text-left">{component.reason}</dd>
          ) : (
            <>
              <dd className="tabular text-right text-sm font-medium text-ink sm:order-last">
                {component.score}
                <span className="sr-only"> out of 100</span>
              </dd>
              <dd aria-hidden="true" className="col-span-2 h-1.5 overflow-hidden rounded-xs bg-none-tint sm:col-span-1">
                <div
                  className="h-full bg-ink-muted"
                  style={{ width: `${Math.min(100, Math.max(0, component.score))}%` }}
                />
              </dd>
            </>
          )}
        </div>
      ))}
    </dl>
  );
}
