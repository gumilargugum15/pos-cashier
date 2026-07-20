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
import { useOpenShift } from "@/hooks/use-shifts";

type OpenShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OpenShiftDialog({ open, onOpenChange }: OpenShiftDialogProps) {
  const [openingBalance, setOpeningBalance] = useState(0);
  const [notes, setNotes] = useState("");
  const openShift = useOpenShift();

  function reset() {
    setOpeningBalance(0);
    setNotes("");
  }

  async function handleSubmit() {
    await openShift.mutateAsync({ opening_balance: openingBalance, notes: notes || null });
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
          <DialogTitle>Buka Shift</DialogTitle>
          <DialogDescription>Masukkan saldo kas awal sebelum mulai berjualan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Saldo Awal</Label>
            <CurrencyInput
              value={openingBalance}
              onChange={setOpeningBalance}
              className="h-10 rounded-xl"
            />
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
            disabled={openShift.isPending}
            onClick={handleSubmit}
          >
            {openShift.isPending ? "Membuka…" : "Buka Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
