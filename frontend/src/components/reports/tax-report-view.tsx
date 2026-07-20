import { SummaryStat } from "@/components/reports/summary-stat";
import { useTaxReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function TaxReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useTaxReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SummaryStat
        label="Pajak Terkumpul (Penjualan)"
        value={formatRupiah(data.tax_collected)}
        tone="success"
      />
      <SummaryStat
        label="Pajak Dibayar (Pembelian)"
        value={formatRupiah(data.tax_paid)}
        tone="danger"
      />
      <SummaryStat label="Pajak Bersih (Harus Disetor)" value={formatRupiah(data.net_tax)} />
    </div>
  );
}
