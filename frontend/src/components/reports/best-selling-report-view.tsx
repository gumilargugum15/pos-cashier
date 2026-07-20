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
import { useBestSellingReport } from "@/hooks/use-reports";
import { formatRupiah } from "@/lib/format-currency";
import type { ReportDateRangeParams } from "@/types/report";

export function BestSellingReportView({ params }: { params: ReportDateRangeParams }) {
  const { data, isLoading } = useBestSellingReport(params);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat laporan…</div>;
  }

  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Produk Terlaris</h3>
        <ExportCsvButton
          rows={data.rows}
          filename="laporan-best-selling"
          columns={[
            { key: "product_name", label: "Produk" },
            { key: "sku", label: "SKU" },
            { key: "category_name", label: "Kategori" },
            { key: "qty_sold", label: "Terjual" },
            { key: "revenue", label: "Pendapatan" },
            { key: "profit", label: "Laba" },
          ]}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Terjual</TableHead>
            <TableHead>Pendapatan</TableHead>
            <TableHead>Laba</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Tidak ada data pada rentang tanggal ini.
              </TableCell>
            </TableRow>
          ) : (
            data.rows.map((row, index) => (
              <TableRow key={row.product_id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{row.product_name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{row.sku}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.category_name ?? "—"}</TableCell>
                <TableCell className="font-semibold">{row.qty_sold}</TableCell>
                <TableCell>{formatRupiah(row.revenue)}</TableCell>
                <TableCell className="text-success font-semibold">
                  {formatRupiah(row.profit)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
