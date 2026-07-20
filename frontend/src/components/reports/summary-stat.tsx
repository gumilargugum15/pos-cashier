import { cn } from "@/lib/utils";

type SummaryStatProps = {
  label: string;
  value: string;
  tone?: "success" | "danger" | "warning";
};

export function SummaryStat({ label, value, tone }: SummaryStatProps) {
  return (
    <div className="rounded-2xl bg-card border p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-xl font-bold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
    </div>
  );
}
