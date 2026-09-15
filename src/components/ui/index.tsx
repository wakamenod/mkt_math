import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card p-4 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "accuracy" | "duration" | "streak";
}) {
  const toneClass = {
    default: "text-ink",
    accuracy: "text-accuracy",
    duration: "text-duration",
    streak: "text-streak",
  }[tone];
  return (
    <div className="surface-card p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className={`tnum mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-accent text-accent-ink hover:bg-accent-hover disabled:bg-surface-3",
    secondary:
      "bg-surface-2 text-ink hover:bg-surface-3 disabled:text-ink-faint",
    ghost: "text-ink-soft hover:bg-surface-2",
    danger: "bg-bad text-accent-ink hover:opacity-90",
  };
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-medium text-ink-soft">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Spinner({ label = "読み込み中…" }: { label?: string }) {
  return (
    <div className="py-10 text-center text-sm text-ink-faint">{label}</div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="rounded-control bg-danger-bg p-3 text-sm text-danger-ink ring-1 ring-danger-line">
      {message}
    </div>
  );
}

/** 0..1 の進捗バー。 */
export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-surface-3 ${className}`}
    >
      <div
        className="h-full rounded-full bg-accuracy transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}
