import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { createUnitColumns } from "@/components/units/unit-columns";
import { UnitFormDialog } from "@/components/units/unit-form-dialog";
import { useDeleteUnit, useUnits } from "@/hooks/use-units";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Unit, UnitListParams } from "@/types/unit";

export const Route = createFileRoute("/units")({
  head: () => ({
    meta: [{ title: "Units · Nova POS" }],
  }),
  component: UnitsPage,
});

function UnitsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: UnitListParams = {
    search: debouncedSearch || undefined,
    sort: (sorting[0]?.id as UnitListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useUnits(params);
  const deleteUnit = useDeleteUnit();

  function handleAdd() {
    setEditingUnit(null);
    setFormOpen(true);
  }

  function handleEdit(unit: Unit) {
    setEditingUnit(unit);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingUnit) return;
    await deleteUnit.mutateAsync(deletingUnit.id);
    setDeletingUnit(null);
  }

  const columns = createUnitColumns({ onEdit: handleEdit, onDelete: setDeletingUnit });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Units"
        description="Manage measurement units used across your catalog."
        crumbs={[{ label: "Home", to: "/" }, { label: "Units" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Unit
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
          searchPlaceholder="Search by name or symbol…"
        />

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada unit."
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

      <UnitFormDialog open={formOpen} onOpenChange={setFormOpen} unit={editingUnit} />

      <AlertDialog open={!!deletingUnit} onOpenChange={(open) => !open && setDeletingUnit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus unit?</AlertDialogTitle>
            <AlertDialogDescription>
              Unit "{deletingUnit?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
