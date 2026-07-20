import { forwardRef } from "react";
import { useSettings } from "@/hooks/use-settings";
import { formatRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { Sale } from "@/types/sale";

const PAYMENT_METHOD_LABELS: Record<Sale["payment_method"], string> = {
  cash: "Cash",
  debit: "Debit",
  credit_card: "Credit Card",
  transfer: "Transfer",
  qris: "QRIS",
  e_wallet: "E-Wallet",
};

type ReceiptProps = { sale: Sale };

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ sale }, ref) => {
  const { data: settings } = useSettings();
  const paperSize = settings?.receipt_paper_size ?? "80mm";

  return (
    <div
      ref={ref}
      id="pos-receipt"
      className={cn(
        "mx-auto p-3 text-[11px] leading-tight text-black",
        paperSize === "58mm" ? "w-[58mm]" : "w-[80mm]",
      )}
    >
      <div className="text-center space-y-0.5">
        <div className="text-sm font-bold">{settings?.company_name ?? "Nova POS"}</div>
        <div>{new Date(sale.created_at).toLocaleString("id-ID")}</div>
        <div className="font-mono">{sale.invoice_number}</div>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="space-y-0.5">
        <div>Kasir: {sale.cashier_name ?? "-"}</div>
        <div>Customer: {sale.customer?.name ?? "Walk-in"}</div>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="space-y-1">
        {sale.items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span className="truncate pr-2">{item.product_name}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                {item.qty} x {formatRupiah(item.price)}
              </span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(sale.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Diskon</span>
          <span>-{formatRupiah(sale.discount_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak</span>
          <span>{formatRupiah(sale.tax_amount)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>Total</span>
          <span>{formatRupiah(sale.grand_total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{PAYMENT_METHOD_LABELS[sale.payment_method]}</span>
          <span>{formatRupiah(sale.paid_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembalian</span>
          <span>{formatRupiah(sale.change_amount)}</span>
        </div>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="text-center">Terima kasih atas kunjungan Anda</div>
    </div>
  );
});
Receipt.displayName = "Receipt";
