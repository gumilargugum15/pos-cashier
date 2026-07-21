import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import type { Purchase } from "@/types/purchase";

type PurchaseColumnHandlers = {
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  onReceive: (purchase: Purchase) => void;
  onCancel: (purchase: Purchase) => void;
  onPay: (purchase: Purchase) => void;
};

const STATUS_LABEL: Record<Purchase["status"], string> = {
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<Purchase["status"], string> = {
  ordered: "bg-warning/10 text-warning hover:bg-warning/10",
  received: "bg-success/10 text-success hover:bg-success/10",
  cancelled: "bg-muted text-muted-foreground hover:bg-muted",
};

const PAYMENT_LABEL: Record<Purchase["payment_status"], string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

const PAYMENT_CLASS: Record<Purchase["payment_status"], string> = {
  unpaid: "bg-danger/10 text-danger hover:bg-danger/10",
  partial: "bg-warning/10 text-warning hover:bg-warning/10",
  paid: "bg-success/10 text-success hover:bg-success/10",
};

export function createPurchaseColumns({
  onView,
  onEdit,
  onDelete,
  onReceive,
  onCancel,
  onPay,
}: PurchaseColumnHandlers): ColumnDef<Purchase>[] {
  return [
    {
      accessorKey: "purchase_number",
      header: "No. Pembelian",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original)}
          className="font-medium font-mono text-primary hover:underline"
        >
          {row.original.purchase_number}
        </button>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: ({ row }) => <span className="truncate">{row.original.supplier?.name ?? "—"}</span>,
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
        <Badge className={cn("rounded-md font-medium", STATUS_CLASS[row.original.status])}>
          {STATUS_LABEL[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Pembayaran",
      cell: ({ row }) => (
        <Badge className={cn("rounded-md font-medium", PAYMENT_CLASS[row.original.payment_status])}>
          {PAYMENT_LABEL[row.original.payment_status]}
        </Badge>
      ),
    },
    {
      accessorKey: "grand_total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">{formatRupiah(row.original.grand_total)}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const purchase = row.original;
        const isOrdered = purchase.status === "ordered";
        const canPay = purchase.status !== "cancelled" && purchase.payment_status !== "paid";
        const canDelete = purchase.status !== "received";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Aksi">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onView(purchase)}>Lihat Detail</DropdownMenuItem>
              {isOrdered && (
                <DropdownMenuItem onClick={() => onEdit(purchase)}>Edit</DropdownMenuItem>
              )}
              {isOrdered && (
                <DropdownMenuItem onClick={() => onReceive(purchase)}>
                  Terima Barang
                </DropdownMenuItem>
              )}
              {canPay && (
                <DropdownMenuItem onClick={() => onPay(purchase)}>
                  Catat Pembayaran
                </DropdownMenuItem>
              )}
              {isOrdered && (
                <DropdownMenuItem className="text-danger" onClick={() => onCancel(purchase)}>
                  Batalkan
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger" onClick={() => onDelete(purchase)}>
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
