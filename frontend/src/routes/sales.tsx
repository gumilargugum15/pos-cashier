import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createSaleColumns } from "@/components/sales/sale-columns";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { CustomerFilterCombobox } from "@/components/sales/customer-filter-combobox";
import { useRefundSale, useSales } from "@/hooks/use-sales";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useActiveBranch } from "@/hooks/use-active-branch";
import type { Sale, SaleListParams } from "@/types/sale";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [{ title: "Sales · Nova POS" }],
  }),
  component: SalesPage,
});

function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SaleListParams["status"]>("");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<SaleListParams["payment_method"]>("");
  const [customerFilter, setCustomerFilter] = useState<{ id: number; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [refundingSale, setRefundingSale] = useState<Sale | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const { effectiveBranchId } = useActiveBranch();

  const params: SaleListParams = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    payment_method: paymentMethodFilter || undefined,
    customer_id: customerFilter?.id ?? undefined,
    branch_id: effectiveBranchId ?? undefined,
    sort: (sorting[0]?.id as SaleListParams["sort"]) ?? "created_at",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useSales(params);
  const refundSale = useRefundSale();

  async function handleConfirmRefund() {
    if (!refundingSale) return;
    await refundSale.mutateAsync(refundingSale.id);
    setRefundingSale(null);
  }

  const columns = createSaleColumns({
    onView: setViewingSale,
    onRefund: setRefundingSale,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Sales"
        description="Riwayat transaksi penjualan, invoice, dan refund."
        crumbs={[{ label: "Home", to: "/" }, { label: "Sales" }]}
      />

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Cari nomor invoice…"
        >
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : (value as SaleListParams["status"]));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="void">Void</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={paymentMethodFilter || "all"}
            onValueChange={(value) => {
              setPaymentMethodFilter(
                value === "all" ? "" : (value as SaleListParams["payment_method"]),
              );
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <SelectValue placeholder="Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="qris">QRIS</SelectItem>
              <SelectItem value="e_wallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>

          <CustomerFilterCombobox
            value={customerFilter}
            onChange={(customer) => {
              setCustomerFilter(customer);
              setPage(1);
            }}
          />
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada transaksi penjualan."
          sorting={sorting}
          onSortingChange={(updater) => {
            setSorting(updater);
            setPage(1);
          }}
        />

        {data && data.meta.total > 0 && (
          <DataTablePagination
            page={data.meta.current_page}
            lastPage={data.meta.last_page}
            total={data.meta.total}
            perPage={data.meta.per_page}
            onPageChange={setPage}
          />
        )}
      </Card>

      <SaleDetailDialog
        open={!!viewingSale}
        onOpenChange={(open) => !open && setViewingSale(null)}
        sale={viewingSale}
      />

      <AlertDialog open={!!refundingSale} onOpenChange={(open) => !open && setRefundingSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi "{refundingSale?.invoice_number}" akan direfund. Stok produk yang terjual
              akan dikembalikan. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRefund}>Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
