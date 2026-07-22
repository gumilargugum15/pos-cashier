import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { navGroups } from "@/config/navigation";

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppSidebar({ className, onNavigate }: AppSidebarProps = {}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = useSettings();
  const { hasPermission } = useAuth();

  const visibleGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={cn(
        "hidden lg:flex sticky top-0 h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-brand">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-sidebar-foreground truncate">
            {settings?.company_name ?? "Nova POS"}
          </div>
          <div className="text-[11px] text-muted-foreground">Retail Suite</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {visibleGroups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.url;
                const Icon = item.icon;
                return (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-brand"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? ""
                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                        )}
                      />
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-xl p-4 glass shadow-soft">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          Shift Active · 09:00
        </div>
      </div>
    </aside>
  );
}
