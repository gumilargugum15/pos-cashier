import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/currency-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayPurchase } from "@/hooks/use-purchases";
import { formatRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { Purchase } from "@/types/purchase";

type PurchaseDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
};

export function PurchaseDetailDialog({ open, onOpenChange, purchase }: PurchaseDetailDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(purchase);
  const payPurchase = usePayPurchase();

  useEffect(() => {
    setCurrentPurchase(purchase);
  }, [purchase]);

  if (!currentPurchase) return null;

  const canPay =
    currentPurchase.status !== "cancelled" && currentPurchase.payment_status !== "paid";

  async function handlePay() {
    if (!currentPurchase || paymentAmount <= 0) return;
    const updated = await payPurchase.mutateAsync({
      id: currentPurchase.id,
      amount: paymentAmount,
    });
    setCurrentPurchase(updated);
    setPaymentAmount(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">{currentPurchase.purchase_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Supplier</div>
              <div className="font-medium">{currentPurchase.supplier?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Dibuat oleh</div>
              <div className="font-medium">{currentPurchase.creator_name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge className="rounded-md mt-0.5">{currentPurchase.status}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Pembayaran</div>
              <Badge className="rounded-md mt-0.5">{currentPurchase.payment_status}</Badge>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Item</div>
            <ul className="divide-y rounded-xl border">
              {currentPurchase.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.qty} x {formatRupiah(item.cost_price)}
                    </div>
                  </div>
                  <div className="font-semibold">{formatRupiah(item.subtotal)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 rounded-xl bg-muted/50 p-3">
            <Row label="Subtotal" value={formatRupiah(currentPurchase.subtotal)} />
            <Row
              label={`Diskon (${currentPurchase.discount_percentage}%)`}
              value={`-${formatRupiah(currentPurchase.discount_amount)}`}
            />
            <Row
              label={`Pajak (${currentPurchase.tax_percentage}%)`}
              value={formatRupiah(currentPurchase.tax_amount)}
            />
            <Row label="Grand Total" value={formatRupiah(currentPurchase.grand_total)} bold />
            <Row label="Dibayar" value={formatRupiah(currentPurchase.paid_amount)} />
            <Row
              label="Sisa Tagihan"
              value={formatRupiah(currentPurchase.remaining_amount)}
              tone="danger"
            />
          </div>

          {currentPurchase.notes && (
            <div>
              <div className="text-xs text-muted-foreground">Catatan</div>
              <div>{currentPurchase.notes}</div>
            </div>
          )}

          {canPay && (
            <div className="flex items-end gap-2 rounded-xl border p-3">
              <div className="flex-1">
                <div className="mb-1 text-xs text-muted-foreground">Catat Pembayaran</div>
                <CurrencyInput
                  value={paymentAmount}
                  onChange={setPaymentAmount}
                  className="h-10 rounded-xl"
                />
              </div>
              <Button
                className="rounded-xl shadow-brand"
                disabled={paymentAmount <= 0 || payPurchase.isPending}
                onClick={handlePay}
              >
                {payPurchase.isPending ? "Menyimpan…" : "Bayar"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "danger";
}) {
  return (
    <div className={cn("flex justify-between", bold && "border-t pt-1 text-base font-bold")}>
      <span className={cn("text-muted-foreground", bold && "text-foreground")}>{label}</span>
      <span className={cn("font-semibold", tone === "danger" && "text-danger")}>{value}</span>
    </div>
  );
}
