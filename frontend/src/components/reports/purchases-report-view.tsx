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
import { usePurchasesReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function PurchasesReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = usePurchasesReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat label="Total Pembelian" value={formatRupiah(data.total)} />
        <SummaryStat label="Jumlah Pembelian" value={String(data.count)} />
        <SummaryStat label="Sudah Dibayar" value={formatRupiah(data.paid_total)} tone="success" />
        <SummaryStat
          label="Sisa Tagihan"
          value={formatRupiah(data.outstanding_total)}
          tone="danger"
        />
      </div>

      <Card className="p-5 rounded-2xl shadow-soft">
        <h3 className="text-sm font-semibold mb-4">Tren Pembelian Harian</h3>
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

        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Berdasarkan Status Pembayaran</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.by_payment_status.map((row) => (
                <TableRow key={row.payment_status}>
                  <TableCell>
                    <Badge className="rounded-md capitalize">{row.payment_status}</Badge>
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
