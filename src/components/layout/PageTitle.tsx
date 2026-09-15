import type { ReactNode } from "react";

export function PageTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-xl font-bold text-ink">{children}</h1>
      {action}
    </div>
  );
}
