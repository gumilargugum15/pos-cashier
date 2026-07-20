import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Kagoem POS" },
      { name: "description", content: "Real-time sales, inventory and store performance overview." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--chart-4)"];

type StatCard = {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
};

function formatPercent(value: number | null): string | undefined {
  if (value === null) return undefined;
  return `${value > 0 ? "+" : ""}${value}%`;
}

function buildStats(stats: DashboardStats): StatCard[] {
  return [
    {
      label: "Today's Sales",
      value: formatRupiah(stats.today_sales),
      delta: formatPercent(stats.today_sales_change_percent),
      up: (stats.today_sales_change_percent ?? 0) >= 0,
      icon: DollarSign,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Today's Profit",
      value: formatRupiah(stats.today_profit),
      delta: formatPercent(stats.today_profit_change_percent),
      up: (stats.today_profit_change_percent ?? 0) >= 0,
      icon: TrendingUp,
      tint: "bg-success/10 text-success",
    },
    {
      label: "Transactions",
      value: String(stats.transactions_count),
      delta: formatPercent(stats.transactions_change_percent),
      up: (stats.transactions_change_percent ?? 0) >= 0,
      icon: Receipt,
      tint: "bg-warning/10 text-warning",
    },
    {
      label: "Products",
      value: String(stats.products_count),
      icon: Package,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Customers",
      value: String(stats.customers_count),
      icon: Users,
      tint: "bg-success/10 text-success",
    },
    {
      label: "Low Stock",
      value: String(stats.low_stock_count),
      delta: stats.low_stock_count > 0 ? "Needs attention" : undefined,
      up: false,
      icon: AlertTriangle,
      tint: "bg-danger/10 text-danger",
    },
    {
      label: "Pending Orders",
      value: String(stats.pending_orders_count),
      icon: ShoppingBag,
      tint: "bg-warning/10 text-warning",
    },
    {
      label: "Cash in Drawer",
      value: formatRupiah(stats.cash_in_drawer),
      icon: Wallet,
      tint: "bg-primary/10 text-primary",
    },
  ];
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Skeleton className="xl:col-span-2 h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card className="p-10 rounded-2xl shadow-soft text-center text-sm text-muted-foreground">
          Gagal memuat data dashboard. Silakan coba lagi.
        </Card>
      </div>
    );
  }

  const stats = buildStats(data.stats);
  const { sales_trend, payment_methods, sales_by_category, top_products, latest_transactions, low_stock_products } =
    data;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quick look at today's sales, inventory, and store performance."
        actions={
          <>
            <Button variant="outline" className="rounded-xl hidden sm:flex">Export</Button>
            <Button className="rounded-xl shadow-brand">New Sale</Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 rounded-2xl shadow-soft border-border/60 hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between">
                <div className={cn("grid size-10 place-items-center rounded-xl", s.tint)}>
                  <Icon className="size-5" />
                </div>
                <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", s.up ? "text-success" : "text-danger")}>
                  {s.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {s.delta}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">{s.value}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Sales Trend</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex gap-1 text-[11px]">
              {["7D", "30D", "90D"].map((t, i) => (
                <button key={t} className={cn("rounded-lg px-2.5 py-1 font-medium", i === 0 ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales_trend}>
                <defs>
                  <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
                <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2.5} fill="url(#s)" />
                <Area type="monotone" dataKey="profit" stroke="var(--success)" strokeWidth={2.5} fill="url(#p)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft">
          <h3 className="text-sm font-semibold mb-1">Payment Methods</h3>
          <p className="text-xs text-muted-foreground mb-4">Today</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={payment_methods} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {payment_methods.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {payment_methods.map((m, i) => (
              <div key={m.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground ml-auto">{m.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl shadow-soft">
          <h3 className="text-sm font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {top_products.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                <span className="text-sm font-medium flex-1 truncate">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.sold} sold</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2 p-5 rounded-2xl shadow-soft">
          <h3 className="text-sm font-semibold mb-1">Sales by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">This week</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b">
            <div>
              <h3 className="text-sm font-semibold">Latest Transactions</h3>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg">View all</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-5 py-2.5">ID</th>
                  <th className="text-left font-medium px-5 py-2.5">Customer</th>
                  <th className="text-left font-medium px-5 py-2.5">Items</th>
                  <th className="text-left font-medium px-5 py-2.5">Method</th>
                  <th className="text-left font-medium px-5 py-2.5">Time</th>
                  <th className="text-right font-medium px-5 py-2.5">Total</th>
                  <th className="text-right font-medium px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {latest_transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      Belum ada transaksi hari ini.
                    </td>
                  </tr>
                )}
                {latest_transactions.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/30 transition">
                    <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                    <td className="px-5 py-3 font-medium">{t.customer}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.items}</td>
                    <td className="px-5 py-3">{t.method}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.time}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatRupiah(t.total)}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        className={cn(
                          "rounded-md font-medium",
                          t.status === "Paid" ? "bg-success/10 text-success hover:bg-success/10" : "bg-danger/10 text-danger hover:bg-danger/10",
                        )}
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b">
            <div>
              <h3 className="text-sm font-semibold">Low Stock Products</h3>
              <p className="text-xs text-muted-foreground">{low_stock_products.length} items</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg">Restock</Button>
          </div>
          <ul className="divide-y">
            {low_stock_products.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">Semua stok aman.</li>
            )}
            {low_stock_products.map((p) => (
              <li key={p.id} className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Package className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.sku}</div>
                </div>
                <Badge className="bg-danger/10 text-danger hover:bg-danger/10 rounded-md">{p.stock} left</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
