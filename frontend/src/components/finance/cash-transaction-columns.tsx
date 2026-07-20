import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import type { CashTransaction } from "@/types/cash-transaction";

const CATEGORY_LABEL: Record<CashTransaction["category"], string> = {
  income: "Pendapatan Lain",
  deposit: "Setoran Modal",
  expense: "Biaya Operasional",
  withdrawal: "Penarikan Kas",
  other: "Lainnya",
};

export function createCashTransactionColumns(): ColumnDef<CashTransaction>[] {
  return [
    {
      accessorKey: "reference_number",
      header: "No. Referensi",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.reference_number}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge
          className={cn(
            "rounded-md",
            row.original.type === "in"
              ? "bg-success/10 text-success hover:bg-success/10"
              : "bg-danger/10 text-danger hover:bg-danger/10",
          )}
        >
          {row.original.type === "in" ? "Kas Masuk" : "Kas Keluar"}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => CATEGORY_LABEL[row.original.category],
    },
    {
      accessorKey: "amount",
      header: "Jumlah",
      cell: ({ row }) => (
        <span
          className={cn(
            "font-semibold",
            row.original.type === "in" ? "text-success" : "text-danger",
          )}
        >
          {row.original.type === "in" ? "+" : "-"}
          {formatRupiah(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Keterangan",
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-52 block">
          {row.original.description}
        </span>
      ),
    },
    {
      id: "user",
      header: "Oleh",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.user_name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString("id-ID"),
    },
  ];
}
