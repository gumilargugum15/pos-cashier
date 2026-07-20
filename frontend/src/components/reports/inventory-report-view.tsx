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
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { useInventoryReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";

export function InventoryReportView() {
  const { data, isLoading } = useInventoryReport();

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat label="Total Produk Aktif" value={String(data.total_products)} />
        <SummaryStat label="Total Stok" value={String(data.total_stock_qty)} />
        <SummaryStat label="Nilai Stok" value={formatRupiah(data.total_stock_value)} />
        <SummaryStat label="Stok Menipis" value={String(data.low_stock_count)} tone="warning" />
      </div>

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nilai Stok per Kategori</h3>
          <ExportCsvButton
            rows={data.by_category}
            filename="laporan-inventory-per-kategori"
            columns={[
              { key: "category", label: "Kategori" },
              { key: "product_count", label: "Jumlah Produk" },
              { key: "stock_qty", label: "Total Stok" },
              { key: "stock_value", label: "Nilai Stok" },
            ]}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Jumlah Produk</TableHead>
              <TableHead>Total Stok</TableHead>
              <TableHead>Nilai Stok</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.by_category.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell>{row.product_count}</TableCell>
                <TableCell>{row.stock_qty}</TableCell>
                <TableCell className="font-semibold">{formatRupiah(row.stock_value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
