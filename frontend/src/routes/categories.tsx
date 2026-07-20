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
import { createCategoryColumns } from "@/components/categories/category-columns";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Category, CategoryListParams } from "@/types/category";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "Categories · Nova POS" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: CategoryListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as CategoryListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useCategories(params);
  const deleteCategory = useDeleteCategory();

  function handleAdd() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingCategory) return;
    await deleteCategory.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  }

  const columns = createCategoryColumns({ onEdit: handleEdit, onDelete: setDeletingCategory });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Categories"
        description="Organize your catalog into a beautiful category tree."
        crumbs={[{ label: "Home", to: "/" }, { label: "Categories" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Category
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
          searchPlaceholder="Search by name or slug…"
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
          emptyMessage="Belum ada kategori."
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

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori "{deletingCategory?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
