import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { useSupplierReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function SupplierReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useSupplierReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Riwayat Pembelian per Supplier</h3>
        <ExportCsvButton
          rows={data.rows}
          filename="laporan-supplier"
          columns={[
            { key: "supplier_name", label: "Supplier" },
            { key: "order_count", label: "Jumlah Pembelian" },
            { key: "total_purchased", label: "Total Pembelian" },
            { key: "avg_order_value", label: "Rata-rata" },
            { key: "last_order_at", label: "Pembelian Terakhir" },
          ]}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Jumlah Pembelian</TableHead>
            <TableHead>Total Pembelian</TableHead>
            <TableHead>Rata-rata</TableHead>
            <TableHead>Pembelian Terakhir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Tidak ada data pada rentang tanggal ini.
              </TableCell>
            </TableRow>
          ) : (
            data.rows.map((row) => (
              <TableRow key={row.supplier_id}>
                <TableCell className="font-medium">{row.supplier_name}</TableCell>
                <TableCell>{row.order_count}</TableCell>
                <TableCell className="font-semibold">{formatRupiah(row.total_purchased)}</TableCell>
                <TableCell>{formatRupiah(row.avg_order_value)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(row.last_order_at).toLocaleDateString("id-ID")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
