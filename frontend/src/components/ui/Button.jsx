import { LoaderCircle } from "lucide-react";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium " +
  "transition-[background-color,border-color,color] duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none";

const VARIANTS = {
  primary: "bg-action text-white hover:bg-action-hover active:bg-action-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink hover:bg-sunken",
  quiet: "px-3 text-ink-muted hover:text-ink hover:underline underline-offset-4"
};

/**
 * @param {{ variant?: "primary" | "secondary" | "quiet", icon?: React.ComponentType, loading?: boolean }} props
 */
export function Button({
  variant = "primary",
  icon: Icon,
  loading = false,
  className = "",
  children,
  type = "button",
  ...rest
}) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:hidden" />
      ) : Icon ? (
        <Icon aria-hidden="true" className="size-4" />
      ) : null}
      {children}
    </button>
  );
}
