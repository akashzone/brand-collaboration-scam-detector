import { useEffect, useRef, useState } from "react";
import { DEMO_MESSAGE, EXAMPLE_MESSAGE } from "../constants/exampleMessage.js";
import { useAnalysis } from "../hooks/useAnalysis.js";
import { Report } from "../components/report/Report.jsx";
import { EmptyReport, ReportError, ReportLoading } from "../components/report/ReportStates.jsx";
import { ReportErrorBoundary } from "../components/report/ReportErrorBoundary.jsx";
import { WorkspacePanel } from "../components/workspace/WorkspacePanel.jsx";
import { MESSAGE_INPUT_ID } from "../components/workspace/MessageForm.jsx";

/** Focus an element and bring its top into view (instantly under reduced motion). */
function focusAndReveal(element) {
  if (!element) return;
  element.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView?.({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
}

/**
 * The only page in V1. It owns the message text and the analysis state, and
 * lays out the workspace (left) and the report (right).
 */
export function AnalyzePage({ onRequestFailed }) {
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [focusInputRequest, setFocusInputRequest] = useState(0);
  const analysis = useAnalysis();
  const reportHeadingRef = useRef(null);

  const { status, error } = analysis;
  const isLoading = status === "loading";
  const requestError = status === "error" && !error.field ? error : null;

  // Validation errors from the backend belong next to the field.
  useEffect(() => {
    if (status === "error" && error.field) setFieldError(error.message);
  }, [status, error]);

  // A network-level failure is a good moment to refresh the header's API status.
  useEffect(() => {
    if (requestError?.code === "BACKEND_UNREACHABLE") onRequestFailed?.();
  }, [requestError, onRequestFailed]);

  // Move focus to the report when its state changes, so keyboard and screen
  // reader users (and mobile users, via scroll) land on the result.
  useEffect(() => {
    if (status === "success" || status === "loading" || requestError) {
      focusAndReveal(reportHeadingRef.current);
    }
  }, [status, requestError]);

  // "Check another message" asks the form to take focus once it has rendered.
  useEffect(() => {
    if (focusInputRequest > 0) focusAndReveal(document.getElementById(MESSAGE_INPUT_ID));
  }, [focusInputRequest]);

  function handleSubmit(value) {
    setFieldError(null);
    setEditing(false);
    analysis.analyze(value);
  }

  function handleEdit() {
    setEditing(true);
    setFocusInputRequest((count) => count + 1);
  }

  function handleClear() {
    setMessage("");
    setFieldError(null);
  }

  const showAnnotated = status === "success" && !editing;
  const isStale = status === "success" && message !== analysis.analyzedMessage;

  let reportView;
  if (isLoading) {
    reportView = <ReportLoading startedAt={analysis.startedAt} headingRef={reportHeadingRef} />;
  } else if (status === "success") {
    reportView = (
      <Report
        ref={reportHeadingRef}
        report={analysis.report}
        completedAt={analysis.completedAt}
        isStale={isStale}
        onCheckAnother={handleEdit}
      />
    );
  } else if (requestError) {
    reportView = (
      <ReportError error={requestError} onRetry={() => handleSubmit(message)} headingRef={reportHeadingRef} />
    );
  } else {
    reportView = <EmptyReport />;
  }

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-h1 font-semibold text-ink">Check a brand collaboration offer</h1>
        <p className="mt-2 text-body text-ink-muted">
          Paste a DM or email from a brand. You’ll get a report that shows the exact words, links, and domains that
          look like a scam, and what to do next.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-6 lg:col-span-5">
          <WorkspacePanel
            showAnnotated={showAnnotated}
            analyzedMessage={analysis.analyzedMessage}
            text={analysis.report?.text}
            onEdit={handleEdit}
            formProps={{
              value: message,
              onChange: setMessage,
              onSubmit: handleSubmit,
              onCancel: analysis.cancel,
              onClear: handleClear,
              onUseExample: () => {
                setMessage(DEMO_MESSAGE);
                setFieldError(null);
              },
              onTryDemo: () => {
                setMessage(DEMO_MESSAGE);
                setFieldError(null);
              },
              isLoading,
              error: fieldError,
              onErrorChange: setFieldError
            }}
          />
        </div>

        {/* On narrow screens a finished report comes first: the verdict before the evidence. */}
        <div
          id="report"
          className={`min-w-0 lg:col-span-7 ${status === "success" ? "order-first lg:order-none" : ""}`}
          aria-busy={isLoading}
        >
          <ReportErrorBoundary resetKey={analysis.completedAt}>{reportView}</ReportErrorBoundary>
        </div>
      </div>
    </main>
  );
}
