import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ScanText, Sparkles, X } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { MAX_MESSAGE_LENGTH } from "../../services/analyzeService.js";
import { formatNumber } from "../../utils/formatters.js";

const NEAR_LIMIT = MAX_MESSAGE_LENGTH * 0.9;

/** Stable id so the page can return focus to the input. Only one form exists. */
export const MESSAGE_INPUT_ID = "message-input";

/** Mirrors the Express controller's checks so most problems are caught before a request. */
export function validateMessage(value) {
  if (!value.trim()) return "Paste the message you received, then select Analyze message.";
  if (value.length > MAX_MESSAGE_LENGTH) {
    return `This message is ${formatNumber(value.length - MAX_MESSAGE_LENGTH)} characters over the ${formatNumber(MAX_MESSAGE_LENGTH)}-character limit. Remove signatures or quoted replies.`;
  }
  return null;
}

export function MessageForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  onClear,
  onUseExample,
  onTryDemo,
  isLoading,
  error,
  onErrorChange
}) {
  const [demoLoaded, setDemoLoaded] = useState(false);
  const textareaRef = useRef(null);
  const ids = useId();
  const helpId = `${ids}-help`;
  const errorId = `${ids}-error`;
  const countId = `${ids}-count`;

  const length = value.length;
  const counterTone =
    length > MAX_MESSAGE_LENGTH ? "text-critical-fg" : length > NEAR_LIMIT ? "text-medium-fg" : "text-ink-subtle";

  function handleTryDemo() {
    if (isLoading) return;
    const demoFn = onTryDemo || onUseExample;
    if (demoFn) demoFn();
    if (error) onErrorChange(null);
    setDemoLoaded(true);
    textareaRef.current?.focus();
  }

  function handleClear() {
    setDemoLoaded(false);
    onClear();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    setDemoLoaded(false);
    const problem = validateMessage(value);
    if (problem) {
      onErrorChange(problem);
      textareaRef.current?.focus();
      return;
    }
    onSubmit(value);
  }

  function handleKeyDown(event) {
    // Ctrl/Cmd + Enter submits, a common convention for multi-line inputs.
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) handleSubmit(event);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
      <label htmlFor={MESSAGE_INPUT_ID} className="text-h3 font-semibold text-ink">
        Message to check
      </label>
      <p id={helpId} className="mt-1 text-sm text-ink-muted">
        Paste the full DM or email, including any links and contact details.
      </p>

      <textarea
        ref={textareaRef}
        id={MESSAGE_INPUT_ID}
        name="message"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          if (error) onErrorChange(null);
          if (demoLoaded) setDemoLoaded(false);
        }}
        onKeyDown={handleKeyDown}
        readOnly={isLoading}
        rows={8}
        autoComplete="off"
        spellCheck={false}
        placeholder="Hi! We love your content and would like to offer you a paid collaboration…"
        aria-required="true"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={`${helpId} ${countId}${error ? ` ${errorId}` : ""}`}
        className={`mt-3 block min-h-44 w-full resize-y rounded-sm border bg-surface px-3 py-3 text-body text-ink placeholder:text-ink-subtle transition-[border-color] duration-150 read-only:bg-sunken read-only:text-ink-muted lg:min-h-72 ${
          error ? "border-critical-solid" : "border-line-strong hover:border-ink-muted"
        }`}
      />

      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0" aria-live="polite">
          {error ? (
            <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-critical-fg">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>
        <p id={countId} className={`tabular shrink-0 text-xs ${counterTone}`}>
          {formatNumber(length)} / {formatNumber(MAX_MESSAGE_LENGTH)}
          <span className="sr-only"> characters</span>
        </p>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {value ? (
            <Button variant="quiet" icon={X} onClick={handleClear} disabled={isLoading}>
              Clear
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {isLoading ? (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              icon={Sparkles}
              onClick={handleTryDemo}
              disabled={isLoading}
            >
              Try Demo Message
            </Button>
          )}
          <Button type="submit" icon={ScanText} loading={isLoading} aria-disabled={isLoading || undefined}>
            {isLoading ? "Analyzing…" : "Analyze message"}
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-subtle">
        <p>Not sure what to test? Try a sample message.</p>
        {demoLoaded ? (
          <p className="font-medium text-action flex items-center gap-1" role="status">
            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
            Demo message loaded. Click Analyze Message to see the results.
          </p>
        ) : null}
      </div>

      <p className="mt-3 hidden text-xs text-ink-subtle sm:block">
        Tip: press <kbd className="font-sans font-medium text-ink-muted">Ctrl</kbd>&nbsp;+&nbsp;
        <kbd className="font-sans font-medium text-ink-muted">Enter</kbd> (
        <kbd className="font-sans font-medium text-ink-muted">⌘</kbd>&nbsp;+&nbsp;
        <kbd className="font-sans font-medium text-ink-muted">Enter</kbd> on a Mac) to analyze.
      </p>
    </form>
  );
}
