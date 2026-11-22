import { Pencil } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { AnnotatedMessage } from "./AnnotatedMessage.jsx";
import { MessageForm } from "./MessageForm.jsx";

/** Left column: the message input, or the annotated message once a report exists. */
export function WorkspacePanel({ showAnnotated, analyzedMessage, text, onEdit, formProps }) {
  return (
    <section
      aria-label="Message"
      className="rounded-md border border-line bg-surface p-4 shadow-sheet sm:p-6"
    >
      {showAnnotated ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h3 font-semibold text-ink">Analyzed message</h2>
            <Button variant="secondary" icon={Pencil} onClick={onEdit}>
              Edit message
            </Button>
          </div>
          <p className="mt-1 mb-3 text-sm text-ink-muted">
            Highlights show the exact words that matched a scam pattern.
          </p>
          <AnnotatedMessage message={analyzedMessage} text={text} />
        </div>
      ) : (
        <MessageForm {...formProps} />
      )}
    </section>
  );
}
