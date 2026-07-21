import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  ScanLine,
  Plus,
  Minus,
  Trash2,
  Package,
  CheckCircle2,
  Printer,
  X,
  Archive,
  PauseCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/currency-input";
import { CustomerCombobox } from "@/components/pos/customer-combobox";
import { PaymentMethodSelector } from "@/components/pos/payment-method-selector";
import { HeldCartsDialog } from "@/components/pos/held-carts-dialog";
import { Receipt } from "@/components/pos/receipt";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useCheckout, extractErrorMessage } from "@/hooks/use-sales";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { useHeldCarts, type HeldCart } from "@/hooks/use-held-carts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBluetoothPrinter } from "@/hooks/use-bluetooth-printer";
import { useSettings } from "@/hooks/use-settings";
import { buildReceiptEscPos } from "@/lib/escpos";
import { listProducts } from "@/api/products";
import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { PaymentMethod, Sale } from "@/types/sale";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS · Nova POS" },
      {
        name: "description",
        content: "Fast checkout with barcode scan, cart, and multi-method payments.",
      },
    ],
  }),
  component: POSPage,
});

type CartLine = { product: Product; qty: number };

function lineMath(product: Product, qty: number) {
  const gross = product.price * qty;
  const discount = Math.round(gross * (product.discount_percentage / 100) * 100) / 100;
  const beforeTax = gross - discount;
  const tax = Math.round(beforeTax * (product.tax_percentage / 100) * 100) / 100;
  const subtotal = beforeTax + tax;
  return { gross, discount, tax, subtotal };
}

function POSPage() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [heldCartsOpen, setHeldCartsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  const { heldCarts, holdCart, discardCart } = useHeldCarts();
  const checkout = useCheckout();
  const { effectiveBranchId } = useActiveBranch();
  const bluetoothPrinter = useBluetoothPrinter();
  const { data: settings } = useSettings();

  const { data: categoriesData } = useCategories({ is_active: "1", per_page: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({
    search: debouncedQuery || undefined,
    category_id: categoryId ?? "",
    is_active: "1",
    per_page: 100,
  });

  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const categories = categoriesData?.data ?? [];

  const add = (p: Product) => {
    if (p.stock <= 0) {
      toast.error(`${p.name} sedang habis stok`);
      return;
    }
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === p.id);
      if (found) {
        if (found.qty + 1 > p.stock) {
          toast.error(`Stok ${p.name} tidak mencukupi`);
          return prev;
        }
        return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product: p, qty: 1 }];
    });
    toast.success(`${p.name} ditambahkan`, { duration: 1200 });
  };

  const setQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.flatMap((l) => {
        if (l.product.id !== id) return [l];
        if (qty <= 0) return [];
        if (qty > l.product.stock) {
          toast.error(`Stok ${l.product.name} tidak mencukupi`);
          return [{ ...l, qty: l.product.stock }];
        }
        return [{ ...l, qty }];
      }),
    );
  };

  const remove = (id: number) => setCart((prev) => prev.filter((l) => l.product.id !== id));

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, l) => {
        const { gross, discount, tax, subtotal } = lineMath(l.product, l.qty);
        return {
          subtotal: acc.subtotal + gross,
          discount: acc.discount + discount,
          tax: acc.tax + tax,
          grandTotal: acc.grandTotal + subtotal,
        };
      },
      { subtotal: 0, discount: 0, tax: 0, grandTotal: 0 },
    );
  }, [cart]);
  const grandTotal = Math.round(totals.grandTotal * 100) / 100;
  const changeAmount = paidAmount - grandTotal;

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== "cash" || paidAmount < grandTotal) {
      setPaidAmount(Math.ceil(grandTotal));
    }
  };

  const handleScanKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !query.trim()) return;
    const term = query.trim();
    try {
      const result = await listProducts({ search: term, is_active: "1", per_page: 5 });
      const exact = result.data.find((p) => p.barcode === term || p.sku === term);
      if (exact) {
        add(exact);
        setQuery("");
      }
    } catch {
      // ignore — leave the search text as-is if the lookup fails
    }
  };

  const handleHold = () => {
    if (cart.length === 0) return;
    holdCart(customer, cart);
    setCart([]);
    setCustomer(null);
    setPaymentMethod(null);
    setPaidAmount(0);
    toast.success("Transaksi ditahan");
  };

  const handleResume = (held: HeldCart) => {
    setCart(held.lines);
    setCustomer(held.customer);
    discardCart(held.id);
    setHeldCartsOpen(false);
    toast.success("Transaksi dilanjutkan");
  };

  const handleCharge = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    if (paidAmount < grandTotal) {
      toast.error("Jumlah pembayaran kurang dari total belanja");
      return;
    }
    try {
      const sale = await checkout.mutateAsync({
        branch_id: effectiveBranchId,
        customer_id: customer?.id ?? null,
        items: cart.map((l) => ({ product_id: l.product.id, qty: l.qty })),
        payment_method: paymentMethod,
        paid_amount: paidAmount,
      });
      setSuccessSale(sale);
      setCart([]);
      setCustomer(null);
      setPaymentMethod(null);
      setPaidAmount(0);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal memproses transaksi"));
    }
  };

  const closeSuccess = () => setSuccessSale(null);

  const handlePrint = async () => {
    if (!successSale) return;

    if (bluetoothPrinter.status === "connected") {
      try {
        const bytes = buildReceiptEscPos(successSale, {
          companyName: settings?.company_name ?? "Nova POS",
          paperSize: settings?.receipt_paper_size ?? "80mm",
        });
        await bluetoothPrinter.print(bytes);
        toast.success("Struk terkirim ke printer Bluetooth");
      } catch {
        toast.error("Gagal mencetak ke printer Bluetooth, mencoba print browser…");
        window.print();
      }
      return;
    }

    window.print();
  };

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row lg:overflow-hidden">
      {/* LEFT — Products */}
      <section className="flex-1 min-w-0 flex flex-col border-r">
        <div className="p-4 lg:p-5 space-y-3 border-b glass sticky top-16 lg:top-0 z-10">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleScanKeyDown}
                placeholder="Cari produk, SKU, atau scan barcode…"
                className="pl-9 h-11 rounded-xl bg-background"
              />
            </div>
            <Button
              variant="outline"
              className="h-11 rounded-xl gap-2"
              onClick={() => searchRef.current?.focus()}
            >
              <ScanLine className="size-4" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl gap-2 relative"
              onClick={() => setHeldCartsOpen(true)}
            >
              <Archive className="size-4" />
              <span className="hidden sm:inline">Held</span>
              {heldCarts.length > 0 && (
                <Badge className="absolute -top-2 -right-2 size-5 p-0 justify-center rounded-full">
                  {heldCarts.length}
                </Badge>
              )}
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setCategoryId(null)}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition",
                categoryId === null
                  ? "bg-primary text-primary-foreground border-primary shadow-brand"
                  : "bg-card hover:bg-accent border-border",
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition",
                  categoryId === c.id
                    ? "bg-primary text-primary-foreground border-primary shadow-brand"
                    : "bg-card hover:bg-accent border-border",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 lg:overflow-y-auto lg:p-5">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="grid place-items-center py-16 text-sm text-muted-foreground lg:h-full lg:py-0">
              Produk tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {products.map((p, i) => {
                const low = p.stock <= p.min_stock;
                const outOfStock = p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={outOfStock}
                    className={cn(
                      "group relative text-left rounded-2xl bg-card border border-border p-3 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
                      i >= 6 && "hidden sm:block",
                    )}
                  >
                    <div className="relative h-20 sm:h-24 md:h-28 rounded-xl bg-muted overflow-hidden">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="size-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="size-full grid place-items-center text-muted-foreground">
                          <Package className="size-6" />
                        </div>
                      )}
                      {p.discount_percentage > 0 && (
                        <Badge className="absolute top-2 left-2 bg-danger text-white rounded-md">
                          -{p.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 min-w-0">
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        {p.sku}
                      </div>
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-primary font-bold">{formatRupiah(p.price)}</span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold rounded-md px-1.5 py-0.5",
                            outOfStock
                              ? "bg-danger/10 text-danger"
                              : low
                                ? "bg-warning/10 text-warning"
                                : "bg-success/10 text-success",
                          )}
                        >
                          {p.stock} stok
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT — Cart */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col bg-card">
        <div className="p-4 lg:p-5 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Current Order</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs rounded-lg"
              disabled={cart.length === 0}
              onClick={handleHold}
            >
              <PauseCircle className="size-3.5" />
              Hold
            </Button>
          </div>
          <CustomerCombobox value={customer} onChange={setCustomer} />
        </div>

        <div className="lg:flex-1 lg:overflow-y-auto">
          {cart.length === 0 ? (
            <div className="grid place-items-center p-8 text-center lg:h-full">
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted">
                  <ScanLine className="size-6 text-muted-foreground" />
                </div>
                <div className="mt-3 text-sm font-semibold">Cart is empty</div>
                <p className="mt-1 text-xs text-muted-foreground">Scan or tap a product to start</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y">
              {cart.map((l) => (
                <li key={l.product.id} className="p-4 flex gap-3">
                  {l.product.image_url ? (
                    <img
                      src={l.product.image_url}
                      alt=""
                      className="size-12 rounded-xl bg-muted shrink-0 object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-xl bg-muted shrink-0 grid place-items-center text-muted-foreground">
                      <Package className="size-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{l.product.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {l.product.sku}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(l.product.id)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border bg-background">
                        <button
                          aria-label="Decrease"
                          onClick={() => setQty(l.product.id, l.qty - 1)}
                          className="grid size-8 place-items-center hover:bg-accent rounded-l-xl"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                        <button
                          aria-label="Increase"
                          onClick={() => setQty(l.product.id, l.qty + 1)}
                          className="grid size-8 place-items-center hover:bg-accent rounded-r-xl"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-bold">
                        {formatRupiah(l.product.price * l.qty)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t p-4 lg:p-5 space-y-3 bg-card">
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatRupiah(totals.subtotal)} />
            <Row label="Discount" value={`-${formatRupiah(totals.discount)}`} tone="success" />
            <Row label="Tax" value={formatRupiah(totals.tax)} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
            <span className="text-sm font-semibold text-primary">Grand Total</span>
            <span className="text-xl font-bold text-primary">{formatRupiah(grandTotal)}</span>
          </div>

          <PaymentMethodSelector value={paymentMethod} onChange={handleSelectPaymentMethod} />

          <div className="grid grid-cols-2 gap-2 items-center">
            <span className="text-xs font-semibold text-muted-foreground">Uang Dibayar</span>
            <CurrencyInput
              value={paidAmount}
              onChange={setPaidAmount}
              className="h-10 rounded-xl"
            />
          </div>
          {paymentMethod && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kembalian</span>
              <span
                className={cn("font-semibold", changeAmount < 0 ? "text-danger" : "text-success")}
              >
                {formatRupiah(Math.max(changeAmount, 0))}
              </span>
            </div>
          )}

          <Button
            onClick={handleCharge}
            disabled={
              cart.length === 0 || !paymentMethod || paidAmount < grandTotal || checkout.isPending
            }
            className="w-full h-12 rounded-xl text-base font-semibold shadow-brand"
          >
            {checkout.isPending ? "Memproses…" : `Charge ${formatRupiah(grandTotal)}`}
          </Button>
        </div>
      </aside>

      <HeldCartsDialog
        open={heldCartsOpen}
        onOpenChange={setHeldCartsOpen}
        heldCarts={heldCarts}
        onResume={handleResume}
        onDiscard={discardCart}
      />

      <Dialog open={!!successSale} onOpenChange={(open) => !open && closeSuccess()}>
        <DialogContent className="rounded-2xl max-w-sm p-0 overflow-hidden">
          <DialogTitle className="sr-only">Payment successful</DialogTitle>
          {successSale && (
            <>
              <div className="p-6 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success animate-in zoom-in">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold">Payment Successful</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction {successSale.invoice_number} recorded.
                </p>
                <div className="mt-4 rounded-xl bg-muted/50 p-4 text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span>{successSale.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">
                      {successSale.payment_method.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                    <span>Total</span>
                    <span>{formatRupiah(successSale.grand_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span>{formatRupiah(successSale.change_amount)}</span>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2"
                    disabled={bluetoothPrinter.isPrinting}
                    onClick={handlePrint}
                  >
                    <Printer className="size-4" />
                    {bluetoothPrinter.isPrinting
                      ? "Mencetak…"
                      : bluetoothPrinter.status === "connected"
                        ? "Print ke Printer Bluetooth"
                        : "Print Receipt"}
                  </Button>
                </div>
                <Button onClick={closeSuccess} className="mt-2 w-full rounded-xl shadow-brand">
                  New Transaction
                </Button>
              </div>
              <div className="hidden print:block">
                <Receipt sale={successSale} />
              </div>
            </>
          )}
          <button
            onClick={closeSuccess}
            aria-label="Close"
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", tone === "success" && "text-success")}>{value}</span>
    </div>
  );
}
