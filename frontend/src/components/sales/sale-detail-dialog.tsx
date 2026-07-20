import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { Sale } from "@/types/sale";

const PAYMENT_METHOD_LABEL: Record<Sale["payment_method"], string> = {
  cash: "Cash",
  debit: "Debit",
  credit_card: "Credit Card",
  transfer: "Transfer",
  qris: "QRIS",
  e_wallet: "E-Wallet",
};

type SaleDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
};

export function SaleDetailDialog({ open, onOpenChange, sale }: SaleDetailDialogProps) {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">{sale.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Customer</div>
              <div className="font-medium">{sale.customer?.name ?? "Walk-in"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Kasir</div>
              <div className="font-medium">{sale.cashier_name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge className="rounded-md mt-0.5">{sale.status}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Metode Pembayaran</div>
              <div className="font-medium">{PAYMENT_METHOD_LABEL[sale.payment_method]}</div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Item</div>
            <ul className="divide-y rounded-xl border">
              {sale.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.qty} x {formatRupiah(item.price)}
                    </div>
                  </div>
                  <div className="font-semibold">{formatRupiah(item.subtotal)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 rounded-xl bg-muted/50 p-3">
            <Row label="Subtotal" value={formatRupiah(sale.subtotal)} />
            <Row label="Diskon" value={`-${formatRupiah(sale.discount_amount)}`} />
            <Row label="Pajak" value={formatRupiah(sale.tax_amount)} />
            <Row label="Grand Total" value={formatRupiah(sale.grand_total)} bold />
            <Row label="Dibayar" value={formatRupiah(sale.paid_amount)} />
            <Row label="Kembalian" value={formatRupiah(sale.change_amount)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "border-t pt-1 text-base font-bold")}>
      <span className={cn("text-muted-foreground", bold && "text-foreground")}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
