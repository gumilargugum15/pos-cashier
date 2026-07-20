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
import { useStockMovementReport } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";
import type { ReportDateRangeParams } from "@/types/report";

const TYPE_LABEL: Record<string, string> = {
  in: "Stock In",
  out: "Stock Out",
  adjustment: "Adjustment",
  transfer: "Transfer",
};

export function StockMovementReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useStockMovementReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryStat label="Perubahan Stok Bersih" value={String(data.net_change)} />
        <SummaryStat label="Tipe Pergerakan" value={String(data.by_type.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Berdasarkan Tipe</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah Transaksi</TableHead>
                <TableHead>Total Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.by_type.map((row) => (
                <TableRow key={row.type}>
                  <TableCell>
                    <Badge className="rounded-md">{TYPE_LABEL[row.type] ?? row.type}</Badge>
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell
                    className={cn(
                      "font-semibold",
                      row.total_quantity > 0
                        ? "text-success"
                        : row.total_quantity < 0
                          ? "text-danger"
                          : "",
                    )}
                  >
                    {row.total_quantity > 0 ? `+${row.total_quantity}` : row.total_quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Produk Paling Sering Bergerak</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Jumlah Transaksi</TableHead>
                <TableHead>Total Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top_products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                data.top_products.map((row) => (
                  <TableRow key={row.product_id}>
                    <TableCell className="font-medium">{row.product_name}</TableCell>
                    <TableCell>{row.movement_count}</TableCell>
                    <TableCell className="font-semibold">{row.total_quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
