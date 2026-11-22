import { AppFooter } from "./components/layout/AppFooter.jsx";
import { AppHeader } from "./components/layout/AppHeader.jsx";
import { SkipLink } from "./components/layout/SkipLink.jsx";
import { useApiHealth } from "./hooks/useApiHealth.js";
import { AnalyzePage } from "./pages/AnalyzePage.jsx";

export default function App() {
  const health = useApiHealth();

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink href="#main">Skip to main content</SkipLink>
      <AppHeader apiStatus={health.status} onRecheckApi={health.recheck} />
      <div className="flex-1">
        <AnalyzePage onRequestFailed={health.recheck} />
      </div>
      <AppFooter />
    </div>
  );
}
