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
import { createBranchColumns } from "@/components/branches/branch-columns";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { useBranches, useDeleteBranch } from "@/hooks/use-branches";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Branch, BranchListParams } from "@/types/branch";

export function BranchSettingsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: BranchListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as BranchListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useBranches(params);
  const deleteBranch = useDeleteBranch();

  function handleAdd() {
    setEditingBranch(null);
    setFormOpen(true);
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingBranch) return;
    await deleteBranch.mutateAsync(deletingBranch.id);
    setDeletingBranch(null);
  }

  const columns = createBranchColumns({ onEdit: handleEdit, onDelete: setDeletingBranch });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
          <Plus className="size-4" />
          Tambah Cabang
        </Button>
      </div>

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Cari nama atau kode cabang…"
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
          emptyMessage="Belum ada cabang."
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

      <BranchFormDialog open={formOpen} onOpenChange={setFormOpen} branch={editingBranch} />

      <AlertDialog
        open={!!deletingBranch}
        onOpenChange={(open) => !open && setDeletingBranch(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus cabang?</AlertDialogTitle>
            <AlertDialogDescription>
              Cabang "{deletingBranch?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
