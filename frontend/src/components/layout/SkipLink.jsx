export function SkipLink({ href, children }) {
  return (
    <a
      href={href}
      className="sr-only rounded-sm bg-surface px-4 py-3 text-sm font-medium text-action focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
    >
      {children}
    </a>
  );
}
