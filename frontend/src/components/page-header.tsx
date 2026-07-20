import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {crumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="size-3" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
