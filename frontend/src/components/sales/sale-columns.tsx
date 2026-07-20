import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import type { Sale } from "@/types/sale";

type SaleColumnHandlers = {
  onView: (sale: Sale) => void;
  onRefund: (sale: Sale) => void;
};

const STATUS_LABEL: Record<Sale["status"], string> = {
  paid: "Paid",
  refunded: "Refunded",
  void: "Void",
  pending: "Pending",
};

const STATUS_CLASS: Record<Sale["status"], string> = {
  paid: "bg-success/10 text-success hover:bg-success/10",
  refunded: "bg-warning/10 text-warning hover:bg-warning/10",
  void: "bg-muted text-muted-foreground hover:bg-muted",
  pending: "bg-danger/10 text-danger hover:bg-danger/10",
};

const PAYMENT_METHOD_LABEL: Record<Sale["payment_method"], string> = {
  cash: "Cash",
  debit: "Debit",
  credit_card: "Credit Card",
  transfer: "Transfer",
  qris: "QRIS",
  e_wallet: "E-Wallet",
};

export function createSaleColumns({ onView, onRefund }: SaleColumnHandlers): ColumnDef<Sale>[] {
  return [
    {
      accessorKey: "invoice_number",
      header: "No. Invoice",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original)}
          className="font-medium font-mono text-primary hover:underline"
        >
          {row.original.invoice_number}
        </button>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="truncate">{row.original.customer?.name ?? "Walk-in"}</span>
      ),
    },
    {
      id: "payment_method",
      header: "Pembayaran",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {PAYMENT_METHOD_LABEL[row.original.payment_method]}
        </span>
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
          {new Date(row.original.created_at).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const sale = row.original;
        const canRefund = sale.status === "paid";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Aksi">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onView(sale)}>Lihat Detail</DropdownMenuItem>
              {canRefund && (
                <DropdownMenuItem className="text-danger" onClick={() => onRefund(sale)}>
                  Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
