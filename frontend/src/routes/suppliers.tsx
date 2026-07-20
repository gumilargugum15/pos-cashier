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
import { createSupplierColumns } from "@/components/suppliers/supplier-columns";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { useDeleteSupplier, useSuppliers } from "@/hooks/use-suppliers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Supplier, SupplierListParams } from "@/types/supplier";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [{ title: "Suppliers · Nova POS" }],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: SupplierListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as SupplierListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useSuppliers(params);
  const deleteSupplier = useDeleteSupplier();

  function handleAdd() {
    setEditingSupplier(null);
    setFormOpen(true);
  }

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingSupplier) return;
    await deleteSupplier.mutateAsync(deletingSupplier.id);
    setDeletingSupplier(null);
  }

  const columns = createSupplierColumns({ onEdit: handleEdit, onDelete: setDeletingSupplier });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Suppliers"
        description="Supplier details, contacts and purchase history."
        crumbs={[{ label: "Home", to: "/" }, { label: "Suppliers" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Supplier
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
          searchPlaceholder="Search by name, contact, phone, or email…"
        >
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : (value as "0" | "1"));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada supplier."
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

      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} supplier={editingSupplier} />

      <AlertDialog
        open={!!deletingSupplier}
        onOpenChange={(open) => !open && setDeletingSupplier(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Supplier "{deletingSupplier?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
