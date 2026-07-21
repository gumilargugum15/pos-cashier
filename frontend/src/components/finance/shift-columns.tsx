import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import type { Shift } from "@/types/shift";

export function createShiftColumns(): ColumnDef<Shift>[] {
  return [
    {
      id: "user",
      header: "Kasir",
      cell: ({ row }) => <span className="font-medium">{row.original.user_name ?? "—"}</span>,
    },
    {
      id: "branch",
      header: "Cabang",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.branch_name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={cn(
            "rounded-md",
            row.original.status === "open"
              ? "bg-success/10 text-success hover:bg-success/10"
              : "bg-muted text-muted-foreground hover:bg-muted",
          )}
        >
          {row.original.status === "open" ? "Open" : "Closed"}
        </Badge>
      ),
    },
    {
      accessorKey: "opening_balance",
      header: "Saldo Awal",
      cell: ({ row }) => formatRupiah(row.original.opening_balance),
    },
    {
      accessorKey: "closing_balance",
      header: "Saldo Akhir",
      cell: ({ row }) =>
        row.original.closing_balance !== null ? formatRupiah(row.original.closing_balance) : "—",
    },
    {
      accessorKey: "variance",
      header: "Selisih",
      cell: ({ row }) => {
        const variance = row.original.variance;
        if (variance === null) return "—";
        return (
          <span
            className={cn(
              "font-semibold",
              variance > 0 ? "text-success" : variance < 0 ? "text-danger" : "",
            )}
          >
            {variance > 0 ? `+${formatRupiah(variance)}` : formatRupiah(variance)}
          </span>
        );
      },
    },
    {
      accessorKey: "opened_at",
      header: "Dibuka",
      cell: ({ row }) => new Date(row.original.opened_at).toLocaleString("id-ID"),
    },
    {
      accessorKey: "closed_at",
      header: "Ditutup",
      cell: ({ row }) =>
        row.original.closed_at ? new Date(row.original.closed_at).toLocaleString("id-ID") : "—",
    },
  ];
}
