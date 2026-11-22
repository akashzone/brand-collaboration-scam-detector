/** Brand mark: a message bubble with one line highlighted, the act of marking evidence. */
export function LogoMark({ className = "size-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#24324a" />
      <path
        d="M8 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4v-4H8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="10" y="12" width="12" height="2.5" rx="1" fill="#fce7b2" />
      <rect x="10" y="16.5" width="7" height="2" rx="1" fill="#8a94a3" />
    </svg>
  );
}
