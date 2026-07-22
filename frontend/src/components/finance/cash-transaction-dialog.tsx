import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateCashTransaction } from "@/hooks/use-cash-transactions";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { cn } from "@/lib/utils";
import type { CashTransactionCategory, CashTransactionType } from "@/types/cash-transaction";

const CATEGORIES: Record<CashTransactionType, { value: CashTransactionCategory; label: string }[]> =
  {
    in: [
      { value: "income", label: "Pendapatan Lain" },
      { value: "deposit", label: "Setoran Modal" },
      { value: "other", label: "Lainnya" },
    ],
    out: [
      { value: "expense", label: "Biaya Operasional" },
      { value: "withdrawal", label: "Penarikan Kas" },
      { value: "other", label: "Lainnya" },
    ],
  };

type CashTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CashTransactionDialog({ open, onOpenChange }: CashTransactionDialogProps) {
  const [type, setType] = useState<CashTransactionType>("in");
  const [category, setCategory] = useState<CashTransactionCategory>("income");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const createTransaction = useCreateCashTransaction();
  const { effectiveBranchId } = useActiveBranch();

  function reset() {
    setType("in");
    setCategory("income");
    setAmount(0);
    setDescription("");
  }

  function handleTypeChange(next: CashTransactionType) {
    setType(next);
    setCategory(CATEGORIES[next][0].value);
  }

  async function handleSubmit() {
    if (amount <= 0 || !description.trim()) return;
    await createTransaction.mutateAsync({
      branch_id: effectiveBranchId,
      type,
      category,
      amount,
      description,
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Catat Kas Masuk / Keluar</DialogTitle>
          <DialogDescription>
            Catat pemasukan atau pengeluaran kas di luar penjualan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("in")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold transition",
                type === "in"
                  ? "border-success bg-success/10 text-success"
                  : "border-input hover:bg-accent",
              )}
            >
              Kas Masuk
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("out")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold transition",
                type === "out"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-input hover:bg-accent",
              )}
            >
              Kas Keluar
            </button>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as CashTransactionCategory)}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES[type].map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <CurrencyInput value={amount} onChange={setAmount} className="h-10 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              placeholder="mis. Bayar listrik bulan Juli"
              className="rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            disabled={amount <= 0 || !description.trim() || createTransaction.isPending}
            onClick={handleSubmit}
          >
            {createTransaction.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
