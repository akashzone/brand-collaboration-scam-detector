import { LogoMark } from "../ui/Logo.jsx";
import { ApiStatus } from "./ApiStatus.jsx";

/**
 * V1 has a single page, so the header carries identity and service status
 * only. It has no navigation links to features that don't exist.
 */
export function AppHeader({ apiStatus, onRecheckApi }) {
  return (
    <header className="bg-band text-band-fg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex min-h-11 min-w-0 items-center gap-3 rounded-sm focus-visible:outline-white">
          <LogoMark className="size-8 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">Scam Detector</span>
            <span className="block truncate text-xs text-band-muted">for brand collaborations</span>
          </span>
        </a>
        <ApiStatus status={apiStatus} onRecheck={onRecheckApi} />
      </div>
    </header>
  );
}
