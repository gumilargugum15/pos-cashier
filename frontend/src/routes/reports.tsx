import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker, type DateRange } from "@/components/reports/date-range-picker";
import { SalesReportView } from "@/components/reports/sales-report-view";
import { PurchasesReportView } from "@/components/reports/purchases-report-view";
import { InventoryReportView } from "@/components/reports/inventory-report-view";
import { ProfitReportView } from "@/components/reports/profit-report-view";
import { TaxReportView } from "@/components/reports/tax-report-view";
import { CustomerReportView } from "@/components/reports/customer-report-view";
import { SupplierReportView } from "@/components/reports/supplier-report-view";
import { BestSellingReportView } from "@/components/reports/best-selling-report-view";
import { StockMovementReportView } from "@/components/reports/stock-movement-report-view";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "Reports · Nova POS" }],
  }),
  component: ReportsPage,
});

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

const TABS = [
  { value: "sales", label: "Penjualan" },
  { value: "purchases", label: "Pembelian" },
  { value: "inventory", label: "Inventory" },
  { value: "profit", label: "Profit" },
  { value: "tax", label: "Pajak" },
  { value: "customers", label: "Customer" },
  { value: "suppliers", label: "Supplier" },
  { value: "best-selling", label: "Best Selling" },
  { value: "stock-movements", label: "Stock Movement" },
];

function ReportsPage() {
  const [tab, setTab] = useState("sales");
  const [range, setRange] = useState<DateRange>(defaultRange());

  const params = { from: range.from, to: range.to };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Reports"
        description="Laporan penjualan, pembelian, inventory, profit, pajak, dan lainnya."
        crumbs={[{ label: "Home", to: "/" }, { label: "Reports" }]}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="flex-wrap h-auto">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tab !== "inventory" && <DateRangePicker value={range} onChange={setRange} />}
        </div>

        <TabsContent value="sales">
          <SalesReportView params={params} />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchasesReportView params={params} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryReportView />
        </TabsContent>
        <TabsContent value="profit">
          <ProfitReportView params={params} />
        </TabsContent>
        <TabsContent value="tax">
          <TaxReportView params={params} />
        </TabsContent>
        <TabsContent value="customers">
          <CustomerReportView params={params} />
        </TabsContent>
        <TabsContent value="suppliers">
          <SupplierReportView params={params} />
        </TabsContent>
        <TabsContent value="best-selling">
          <BestSellingReportView params={params} />
        </TabsContent>
        <TabsContent value="stock-movements">
          <StockMovementReportView params={params} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
