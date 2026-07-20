import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/format-currency";
import type { HeldCart } from "@/hooks/use-held-carts";

type HeldCartsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heldCarts: HeldCart[];
  onResume: (cart: HeldCart) => void;
  onDiscard: (id: string) => void;
};

export function HeldCartsDialog({
  open,
  onOpenChange,
  heldCarts,
  onResume,
  onDiscard,
}: HeldCartsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>Held Transactions</DialogTitle>
        </DialogHeader>
        {heldCarts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Archive className="mx-auto mb-2 size-8 opacity-50" />
            No held transactions.
          </div>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {heldCarts.map((cart) => {
              const total = cart.lines.reduce(
                (sum, line) => sum + line.product.price * line.qty,
                0,
              );
              return (
                <li key={cart.id} className="flex items-center gap-2 rounded-xl border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{cart.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {cart.lines.length} item · {formatRupiah(total)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(cart.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Button size="sm" className="rounded-lg" onClick={() => onResume(cart)}>
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-danger hover:text-danger"
                    onClick={() => onDiscard(cart.id)}
                    aria-label="Discard"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
