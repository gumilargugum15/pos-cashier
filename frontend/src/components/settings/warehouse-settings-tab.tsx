import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
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
import { createWarehouseColumns } from "@/components/warehouses/warehouse-columns";
import { WarehouseFormDialog } from "@/components/warehouses/warehouse-form-dialog";
import { useDeleteWarehouse, useWarehouses } from "@/hooks/use-warehouses";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Warehouse, WarehouseListParams } from "@/types/warehouse";

export function WarehouseSettingsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: WarehouseListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as WarehouseListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useWarehouses(params);
  const deleteWarehouse = useDeleteWarehouse();

  function handleAdd() {
    setEditingWarehouse(null);
    setFormOpen(true);
  }

  function handleEdit(warehouse: Warehouse) {
    setEditingWarehouse(warehouse);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingWarehouse) return;
    await deleteWarehouse.mutateAsync(deletingWarehouse.id);
    setDeletingWarehouse(null);
  }

  const columns = createWarehouseColumns({ onEdit: handleEdit, onDelete: setDeletingWarehouse });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
          <Plus className="size-4" />
          Tambah Gudang
        </Button>
      </div>

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Cari nama atau kode gudang…"
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
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada gudang."
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

      <WarehouseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        warehouse={editingWarehouse}
      />

      <AlertDialog
        open={!!deletingWarehouse}
        onOpenChange={(open) => !open && setDeletingWarehouse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus gudang?</AlertDialogTitle>
            <AlertDialogDescription>
              Gudang "{deletingWarehouse?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
