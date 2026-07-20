import { PlusCircle, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SummaryStat } from "@/components/reports/summary-stat";
import { formatRupiah } from "@/lib/format-currency";
import type { Shift, ShiftLiveSummary } from "@/types/shift";

type DrawerSummaryCardProps = {
  shift: Shift | null;
  live: ShiftLiveSummary | null;
  onOpenShift: () => void;
  onCloseShift: () => void;
  onRecordTransaction: () => void;
};

export function DrawerSummaryCard({
  shift,
  live,
  onOpenShift,
  onCloseShift,
  onRecordTransaction,
}: DrawerSummaryCardProps) {
  if (!shift || !live) {
    return (
      <Card className="rounded-2xl shadow-soft p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted">
          <Wallet className="size-6 text-muted-foreground" />
        </div>
        <div className="mt-3 text-sm font-semibold">Belum ada shift aktif</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Buka shift untuk mulai mencatat kas masuk/keluar dan menerima pembayaran tunai.
        </p>
        <Button className="mt-4 rounded-xl shadow-brand" onClick={onOpenShift}>
          Buka Shift
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-soft p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Shift Aktif</h3>
            <Badge className="rounded-md bg-success/10 text-success hover:bg-success/10">
              Open
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {shift.user_name} · dibuka {new Date(shift.opened_at).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2" onClick={onRecordTransaction}>
            <PlusCircle className="size-4" />
            Catat Kas
          </Button>
          <Button className="rounded-xl shadow-brand" onClick={onCloseShift}>
            Tutup Shift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryStat label="Saldo Awal" value={formatRupiah(shift.opening_balance)} />
        <SummaryStat label="Penjualan Tunai" value={formatRupiah(live.cash_sales)} />
        <SummaryStat label="Kas Masuk" value={formatRupiah(live.cash_in_total)} tone="success" />
        <SummaryStat label="Kas Keluar" value={formatRupiah(live.cash_out_total)} tone="danger" />
        <SummaryStat label="Ekspektasi Saldo" value={formatRupiah(live.expected_balance)} />
      </div>
    </Card>
  );
}
