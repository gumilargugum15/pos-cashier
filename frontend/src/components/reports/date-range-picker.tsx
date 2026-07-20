import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DateRange = { from: string; to: string };

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function preset(days: number): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function thisMonth(): DateRange {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toIsoDate(from), to: toIsoDate(now) };
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: "7 Hari", range: () => preset(7) },
  { label: "30 Hari", range: () => preset(30) },
  { label: "Bulan Ini", range: () => thisMonth() },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="h-10 w-40 rounded-xl"
      />
      <span className="text-muted-foreground text-sm">—</span>
      <Input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="h-10 w-40 rounded-xl"
      />
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-10 rounded-xl")}
            onClick={() => onChange(p.range())}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
