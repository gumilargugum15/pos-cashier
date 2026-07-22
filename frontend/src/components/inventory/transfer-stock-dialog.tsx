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
import type { Product } from "@/types/product";

type TransferStockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransferStockDialog({ open, onOpenChange }: TransferStockDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fromWarehouseId, setFromWarehouseId] = useState<number | null>(null);
  const [toWarehouseId, setToWarehouseId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const createMovement = useCreateStockMovement();
  const { effectiveBranchId } = useActiveBranch();

  const sameWarehouse = !!fromWarehouseId && !!toWarehouseId && fromWarehouseId === toWarehouseId;
  const canSubmit =
    !!product && quantity > 0 && !!fromWarehouseId && !!toWarehouseId && !sameWarehouse;

  function reset() {
    setProduct(null);
    setQuantity(1);
    setFromWarehouseId(null);
    setToWarehouseId(null);
    setReason("");
  }

  async function handleSubmit() {
    if (!canSubmit || !product || !fromWarehouseId || !toWarehouseId) return;

    await createMovement.mutateAsync({
      branch_id: effectiveBranchId,
      product_id: product.id,
      type: "transfer",
      quantity,
      from_warehouse_id: fromWarehouseId,
      to_warehouse_id: toWarehouseId,
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
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>Catat perpindahan stok antar gudang.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dari Gudang</Label>
              <WarehouseSelect value={fromWarehouseId} onChange={setFromWarehouseId} />
            </div>
            <div className="space-y-2">
              <Label>Ke Gudang</Label>
              <WarehouseSelect
                value={toWarehouseId}
                onChange={setToWarehouseId}
                excludeId={fromWarehouseId}
              />
            </div>
          </div>
          {sameWarehouse && (
            <p className="text-sm text-destructive">
              Gudang tujuan harus berbeda dari gudang asal.
            </p>
          )}

          <div className="space-y-2">
            <Label>Alasan</Label>
            <Textarea
              placeholder="mis. Restock cabang, permintaan gudang"
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
            disabled={!canSubmit || createMovement.isPending}
            onClick={handleSubmit}
          >
            {createMovement.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
