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
import { createBrandColumns } from "@/components/brands/brand-columns";
import { BrandFormDialog } from "@/components/brands/brand-form-dialog";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Brand, BrandListParams } from "@/types/brand";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [{ title: "Brands · Nova POS" }],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: BrandListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as BrandListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useBrands(params);
  const deleteBrand = useDeleteBrand();

  function handleAdd() {
    setEditingBrand(null);
    setFormOpen(true);
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingBrand) return;
    await deleteBrand.mutateAsync(deletingBrand.id);
    setDeletingBrand(null);
  }

  const columns = createBrandColumns({ onEdit: handleEdit, onDelete: setDeletingBrand });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Brands"
        description="Manage the product brands used across your catalog."
        crumbs={[{ label: "Home", to: "/" }, { label: "Brands" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Brand
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
          searchPlaceholder="Search by name…"
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
          emptyMessage="Belum ada brand."
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

      <BrandFormDialog open={formOpen} onOpenChange={setFormOpen} brand={editingBrand} />

      <AlertDialog open={!!deletingBrand} onOpenChange={(open) => !open && setDeletingBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus brand?</AlertDialogTitle>
            <AlertDialogDescription>
              Brand "{deletingBrand?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
