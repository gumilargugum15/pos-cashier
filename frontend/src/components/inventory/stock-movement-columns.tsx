import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StockMovement } from "@/types/stock-movement";

const TYPE_LABEL: Record<StockMovement["type"], string> = {
  in: "Stock In",
  out: "Stock Out",
  adjustment: "Adjustment",
  transfer: "Transfer",
};

const TYPE_CLASS: Record<StockMovement["type"], string> = {
  in: "bg-success/10 text-success hover:bg-success/10",
  out: "bg-danger/10 text-danger hover:bg-danger/10",
  adjustment: "bg-warning/10 text-warning hover:bg-warning/10",
  transfer: "bg-primary/10 text-primary hover:bg-primary/10",
};

export function createStockMovementColumns(): ColumnDef<StockMovement>[] {
  return [
    {
      accessorKey: "reference_number",
      header: "No. Referensi",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.reference_number}</span>
      ),
    },
    {
      id: "product",
      header: "Produk",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.product?.name ?? "—"}</div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {row.original.product?.sku ?? ""}
          </div>
        </div>
      ),
    },
    {
      id: "branch",
      header: "Cabang",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.branch_name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge className={cn("rounded-md font-medium", TYPE_CLASS[row.original.type])}>
          {TYPE_LABEL[row.original.type]}
        </Badge>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => {
        const qty = row.original.quantity;
        return (
          <span
            className={cn("font-semibold", qty > 0 ? "text-success" : qty < 0 ? "text-danger" : "")}
          >
            {qty > 0 ? `+${qty}` : qty}
          </span>
        );
      },
    },
    {
      id: "stock_change",
      header: "Stok",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.stock_before} → {row.original.stock_after}
        </span>
      ),
    },
    {
      id: "warehouse",
      header: "Gudang",
      cell: ({ row }) => {
        const m = row.original;
        if (m.type === "transfer") {
          return (
            <span className="text-muted-foreground">
              {m.from_warehouse?.name ?? "—"} → {m.to_warehouse?.name ?? "—"}
            </span>
          );
        }
        return <span className="text-muted-foreground">{m.warehouse?.name ?? "—"}</span>;
      },
    },
    {
      id: "reason",
      header: "Alasan",
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-40 block">
          {row.original.reason ?? "—"}
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
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.created_at).toLocaleString("id-ID")}
        </span>
      ),
    },
  ];
}
