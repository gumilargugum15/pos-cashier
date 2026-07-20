import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCloseShift } from "@/hooks/use-shifts";
import { formatRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { Shift, ShiftLiveSummary } from "@/types/shift";

type CloseShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  live: ShiftLiveSummary | null;
};

export function CloseShiftDialog({ open, onOpenChange, shift, live }: CloseShiftDialogProps) {
  const [closingBalance, setClosingBalance] = useState(0);
  const [notes, setNotes] = useState("");
  const closeShift = useCloseShift();

  const expected = live?.expected_balance ?? 0;
  const variance = closingBalance - expected;

  function reset() {
    setClosingBalance(0);
    setNotes("");
  }

  async function handleSubmit() {
    if (!shift) return;
    await closeShift.mutateAsync({
      id: shift.id,
      payload: { closing_balance: closingBalance, notes: notes || null },
    });
    reset();
    onOpenChange(false);
  }

  if (!shift || !live) return null;

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
          <DialogTitle>Tutup Shift</DialogTitle>
          <DialogDescription>Hitung kas fisik dan bandingkan dengan sistem.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 rounded-xl bg-muted/50 p-3 text-sm">
            <Row label="Saldo Awal" value={formatRupiah(shift.opening_balance)} />
            <Row label="Penjualan Tunai" value={formatRupiah(live.cash_sales)} />
            <Row label="Kas Masuk Manual" value={formatRupiah(live.cash_in_total)} />
            <Row label="Kas Keluar Manual" value={`-${formatRupiah(live.cash_out_total)}`} />
            <Row label="Saldo Sistem (Ekspektasi)" value={formatRupiah(expected)} bold />
          </div>

          <div className="space-y-2">
            <Label>Saldo Fisik (Hasil Hitung)</Label>
            <CurrencyInput
              value={closingBalance}
              onChange={setClosingBalance}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <span className="text-muted-foreground">Selisih</span>
            <span
              className={cn(
                "font-bold",
                variance > 0
                  ? "text-success"
                  : variance < 0
                    ? "text-danger"
                    : "text-muted-foreground",
              )}
            >
              {variance > 0 ? `+${formatRupiah(variance)}` : formatRupiah(variance)}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              placeholder="Opsional"
              className="rounded-xl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            disabled={closeShift.isPending}
            onClick={handleSubmit}
          >
            {closeShift.isPending ? "Menutup…" : "Tutup Shift"}
          </Button>
        </DialogFooter>
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
