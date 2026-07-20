import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SummaryStat } from "@/components/reports/summary-stat";
import { useProfitReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function ProfitReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useProfitReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat label="Pendapatan" value={formatRupiah(data.revenue)} />
        <SummaryStat label="Modal (HPP)" value={formatRupiah(data.cost)} />
        <SummaryStat label="Laba Kotor" value={formatRupiah(data.profit)} tone="success" />
        <SummaryStat label="Margin" value={`${data.margin_percent}%`} />
      </div>

      <Card className="p-5 rounded-2xl shadow-soft">
        <h3 className="text-sm font-semibold mb-4">Tren Laba Harian</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="var(--destructive)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="var(--success)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Laba per Kategori</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Pendapatan</TableHead>
              <TableHead>Modal</TableHead>
              <TableHead>Laba</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.by_category.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell>{formatRupiah(row.revenue)}</TableCell>
                <TableCell>{formatRupiah(row.cost)}</TableCell>
                <TableCell className="font-semibold text-success">
                  {formatRupiah(row.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
