import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SummaryStat } from "@/components/reports/summary-stat";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { useSalesReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function SalesReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useSalesReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat label="Total Penjualan" value={formatRupiah(data.total)} />
        <SummaryStat label="Jumlah Transaksi" value={String(data.count)} />
        <SummaryStat label="Rata-rata / Transaksi" value={formatRupiah(data.avg)} />
        <SummaryStat label="Total Diskon" value={formatRupiah(data.discount_total)} />
      </div>

      <Card className="p-5 rounded-2xl shadow-soft">
        <h3 className="text-sm font-semibold mb-4">Tren Penjualan Harian</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold">Berdasarkan Metode Pembayaran</h3>
            <ExportCsvButton
              rows={data.by_payment_method}
              filename="laporan-penjualan-metode-pembayaran"
              columns={[
                { key: "method", label: "Metode" },
                { key: "count", label: "Jumlah" },
                { key: "total", label: "Total" },
              ]}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.by_payment_method.map((row) => (
                <TableRow key={row.method}>
                  <TableCell className="capitalize">{row.method.replace("_", " ")}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell className="font-semibold">{formatRupiah(row.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Berdasarkan Status</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.by_status.map((row) => (
                <TableRow key={row.status}>
                  <TableCell>
                    <Badge className="rounded-md capitalize">{row.status}</Badge>
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell className="font-semibold">{formatRupiah(row.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
