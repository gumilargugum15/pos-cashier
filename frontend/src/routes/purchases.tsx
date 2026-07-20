import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { createPurchaseColumns } from "@/components/purchases/purchase-columns";
import { PurchaseFormDialog } from "@/components/purchases/purchase-form-dialog";
import { PurchaseDetailDialog } from "@/components/purchases/purchase-detail-dialog";
import {
  useCancelPurchase,
  useDeletePurchase,
  usePurchases,
  useReceivePurchase,
} from "@/hooks/use-purchases";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Purchase, PurchaseListParams } from "@/types/purchase";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [{ title: "Purchases · Nova POS" }],
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseListParams["status"]>("");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PurchaseListParams["payment_status"]>("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(null);
  const [receivingPurchase, setReceivingPurchase] = useState<Purchase | null>(null);
  const [cancellingPurchase, setCancellingPurchase] = useState<Purchase | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: PurchaseListParams = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    payment_status: paymentStatusFilter || undefined,
    sort: (sorting[0]?.id as PurchaseListParams["sort"]) ?? "created_at",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = usePurchases(params);
  const deletePurchase = useDeletePurchase();
  const receivePurchase = useReceivePurchase();
  const cancelPurchase = useCancelPurchase();

  function handleAdd() {
    setEditingPurchase(null);
    setFormOpen(true);
  }

  function handleEdit(purchase: Purchase) {
    setEditingPurchase(purchase);
    setFormOpen(true);
  }

  function handlePay(purchase: Purchase) {
    setViewingPurchase(purchase);
  }

  async function handleConfirmDelete() {
    if (!deletingPurchase) return;
    await deletePurchase.mutateAsync(deletingPurchase.id);
    setDeletingPurchase(null);
  }

  async function handleConfirmReceive() {
    if (!receivingPurchase) return;
    await receivePurchase.mutateAsync(receivingPurchase.id);
    setReceivingPurchase(null);
  }

  async function handleConfirmCancel() {
    if (!cancellingPurchase) return;
    await cancelPurchase.mutateAsync(cancellingPurchase.id);
    setCancellingPurchase(null);
  }

  const columns = createPurchaseColumns({
    onView: setViewingPurchase,
    onEdit: handleEdit,
    onDelete: setDeletingPurchase,
    onReceive: setReceivingPurchase,
    onCancel: setCancellingPurchase,
    onPay: handlePay,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Purchases"
        description="Purchase orders, receiving, invoices and supplier payments."
        crumbs={[{ label: "Home", to: "/" }, { label: "Purchases" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Buat Pembelian
          </Button>
        }
      />

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Cari nomor pembelian atau supplier…"
        >
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : (value as PurchaseListParams["status"]));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={paymentStatusFilter || "all"}
            onValueChange={(value) => {
              setPaymentStatusFilter(
                value === "all" ? "" : (value as PurchaseListParams["payment_status"]),
              );
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <SelectValue placeholder="Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pembayaran</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada pembelian."
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

      <PurchaseFormDialog open={formOpen} onOpenChange={setFormOpen} purchase={editingPurchase} />

      <PurchaseDetailDialog
        open={!!viewingPurchase}
        onOpenChange={(open) => !open && setViewingPurchase(null)}
        purchase={viewingPurchase}
      />

      <AlertDialog
        open={!!deletingPurchase}
        onOpenChange={(open) => !open && setDeletingPurchase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pembelian?</AlertDialogTitle>
            <AlertDialogDescription>
              Pembelian "{deletingPurchase?.purchase_number}" akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!receivingPurchase}
        onOpenChange={(open) => !open && setReceivingPurchase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terima barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Stok produk pada pembelian "{receivingPurchase?.purchase_number}" akan bertambah
              sesuai jumlah item, dan harga modal produk akan diperbarui. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReceive}>Terima</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!cancellingPurchase}
        onOpenChange={(open) => !open && setCancellingPurchase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pembelian?</AlertDialogTitle>
            <AlertDialogDescription>
              Pembelian "{cancellingPurchase?.purchase_number}" akan dibatalkan dan tidak dapat
              diterima lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Batalkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
