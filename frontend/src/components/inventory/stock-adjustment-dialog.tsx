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

type StockAdjustmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StockAdjustmentDialog({ open, onOpenChange }: StockAdjustmentDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const createMovement = useCreateStockMovement();
  const { effectiveBranchId } = useActiveBranch();

  const delta = product ? newStock - product.stock : 0;

  function reset() {
    setProduct(null);
    setNewStock(0);
    setWarehouseId(null);
    setReason("");
  }

  function handleSelectProduct(p: Product) {
    setProduct(p);
    setNewStock(p.stock);
  }

  async function handleSubmit() {
    if (!product || newStock < 0) return;

    await createMovement.mutateAsync({
      branch_id: effectiveBranchId,
      product_id: product.id,
      type: "adjustment",
      new_stock: newStock,
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
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>
            Sesuaikan stok berdasarkan hasil penghitungan fisik (stok opname) atau koreksi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Produk</Label>
            {product ? (
              <div className="flex items-center gap-2 rounded-xl border p-2.5">
                <Package className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">Stok sistem: {product.stock}</div>
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
              <ProductCombobox onSelect={handleSelectProduct} />
            )}
          </div>

          <div className="space-y-2">
            <Label>Stok Aktual (hasil hitung fisik)</Label>
            <Input
              type="number"
              min={0}
              className="h-10 rounded-xl"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              disabled={!product}
            />
          </div>

          {product && (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Selisih</span>
              <span
                className={cn(
                  "font-bold",
                  delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted-foreground",
                )}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Gudang (opsional)</Label>
            <WarehouseSelect value={warehouseId} onChange={setWarehouseId} optional />
          </div>

          <div className="space-y-2">
            <Label>Alasan</Label>
            <Textarea
              placeholder="mis. Hasil stok opname bulan Juli"
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
            disabled={!product || newStock < 0 || createMovement.isPending}
            onClick={handleSubmit}
          >
            {createMovement.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
