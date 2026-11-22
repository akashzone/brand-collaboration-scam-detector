import { Component } from "react";
import { Alert } from "../ui/Alert.jsx";

/**
 * Last line of defence: if the report can’t be rendered (for example, an API
 * response shape this version doesn’t expect), show a clear message instead of
 * blanking the whole page. The message input stays usable.
 */
export class ReportErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Developer-facing detail only; users see the friendly message below.
    console.error("Report rendering failed:", error);
  }

  componentDidUpdate(previousProps) {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="rounded-md border border-line bg-surface px-4 py-6 shadow-sheet sm:px-8">
        <Alert tone="error" role="alert" title="This report couldn’t be displayed" headingLevel={2}>
          <p>
            The analysis finished, but its results came back in a form this page can’t show. Try analyzing the
            message again. If it keeps happening, the API may have changed.
          </p>
        </Alert>
      </div>
    );
  }
}
