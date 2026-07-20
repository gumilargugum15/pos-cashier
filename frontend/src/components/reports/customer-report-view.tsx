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
import { useCustomerReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function CustomerReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useCustomerReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Riwayat Pembelian Customer</h3>
        <ExportCsvButton
          rows={data.rows}
          filename="laporan-customer"
          columns={[
            { key: "customer_name", label: "Customer" },
            { key: "order_count", label: "Jumlah Transaksi" },
            { key: "total_spent", label: "Total Belanja" },
            { key: "avg_order_value", label: "Rata-rata" },
            { key: "last_order_at", label: "Transaksi Terakhir" },
          ]}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Jumlah Transaksi</TableHead>
            <TableHead>Total Belanja</TableHead>
            <TableHead>Rata-rata</TableHead>
            <TableHead>Transaksi Terakhir</TableHead>
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
              <TableRow key={row.customer_id}>
                <TableCell className="font-medium">{row.customer_name}</TableCell>
                <TableCell>{row.order_count}</TableCell>
                <TableCell className="font-semibold">{formatRupiah(row.total_spent)}</TableCell>
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
