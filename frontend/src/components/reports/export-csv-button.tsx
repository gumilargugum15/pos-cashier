import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Column<T> = {
  key: keyof T;
  label: string;
};

type ExportCsvButtonProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: Column<T>[];
  filename: string;
};

function escapeCsvValue(value: unknown): string {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function ExportCsvButton<T extends Record<string, unknown>>({
  rows,
  columns,
  filename,
}: ExportCsvButtonProps<T>) {
  function handleExport() {
    const header = columns.map((c) => escapeCsvValue(c.label)).join(",");
    const lines = rows.map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(","));
    const csv = [header, ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 rounded-xl gap-2"
      disabled={rows.length === 0}
      onClick={handleExport}
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
