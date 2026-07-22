import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCombobox } from "@/components/purchases/product-combobox";
import { WarehouseSelect } from "@/components/inventory/warehouse-select";
import { useCreateStockMovement } from "@/hooks/use-stock-movements";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { StockMovementType } from "@/types/stock-movement";

type StockInOutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StockInOutDialog({ open, onOpenChange }: StockInOutDialogProps) {
  const [type, setType] = useState<Extract<StockMovementType, "in" | "out">>("in");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const createMovement = useCreateStockMovement();
  const { effectiveBranchId } = useActiveBranch();

  function reset() {
    setType("in");
    setProduct(null);
    setQuantity(1);
    setWarehouseId(null);
    setReason("");
  }

  async function handleSubmit() {
    if (!product || quantity < 1) return;

    await createMovement.mutateAsync({
      branch_id: effectiveBranchId,
      product_id: product.id,
      type,
      quantity,
      warehouse_id: warehouseId,
      reason: reason || null,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Stok Masuk / Keluar</DialogTitle>
          <DialogDescription>
            Catat pergerakan stok manual di luar transaksi pembelian/penjualan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("in")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold transition",
                type === "in"
                  ? "border-success bg-success/10 text-success"
                  : "border-input hover:bg-accent",
              )}
            >
              Stock In
            </button>
            <button
              type="button"
              onClick={() => setType("out")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold transition",
                type === "out"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-input hover:bg-accent",
              )}
            >
              Stock Out
            </button>
          </div>

          <div className="space-y-2">
            <Label>Produk</Label>
            {product ? (
              <div className="flex items-center gap-2 rounded-xl border p-2.5">
                <Package className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Stok saat ini: {product.stock}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setProduct(null)}
                >
                  Ganti
                </Button>
              </div>
            ) : (
              <ProductCombobox onSelect={setProduct} />
            )}
          </div>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <Input
              type="number"
              min={1}
              className="h-10 rounded-xl"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            {type === "out" && product && quantity > product.stock && (
              <p className="text-sm text-destructive">
                Stok tidak mencukupi (tersisa {product.stock}).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Gudang (opsional)</Label>
            <WarehouseSelect value={warehouseId} onChange={setWarehouseId} optional />
          </div>

          <div className="space-y-2">
            <Label>Alasan</Label>
            <Textarea
              placeholder="mis. Retur dari customer, barang rusak, dsb."
              className="rounded-xl"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            className="rounded-xl shadow-brand"
            disabled={
              !product ||
              quantity < 1 ||
              (type === "out" && !!product && quantity > product.stock) ||
              createMovement.isPending
            }
            onClick={handleSubmit}
          >
            {createMovement.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
