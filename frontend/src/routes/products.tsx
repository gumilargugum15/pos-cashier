import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Download, Plus, Upload } from "lucide-react";
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
import { createProductColumns } from "@/components/products/product-columns";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { useDeleteProduct, useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product, ProductListParams } from "@/types/product";

type ProductsSearch = {
  q?: string;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Products · Nova POS" },
      { name: "description", content: "Manage your catalog, stock, pricing, and variants." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q } = Route.useSearch();
  const [search, setSearch] = useState(q ?? "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [lowStockOnly, setLowStockOnly] = useState<"" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: categoriesData } = useCategories({ per_page: 100 });

  const params: ProductListParams = {
    search: debouncedSearch || undefined,
    category_id: categoryFilter ? Number(categoryFilter) : undefined,
    is_active: statusFilter || undefined,
    low_stock: lowStockOnly || undefined,
    sort: (sorting[0]?.id as ProductListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useProducts(params);
  const deleteProduct = useDeleteProduct();

  function handleAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingProduct) return;
    await deleteProduct.mutateAsync(deletingProduct.id);
    setDeletingProduct(null);
  }

  const columns = createProductColumns({ onEdit: handleEdit, onDelete: setDeletingProduct });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Products"
        description={
          data
            ? `${data.meta.total} items across ${categoriesData?.data.length ?? 0} categories`
            : ""
        }
        crumbs={[{ label: "Home", to: "/" }, { label: "Products" }]}
        actions={
          <>
            <Button variant="outline" className="rounded-xl gap-2">
              <Upload className="size-4" />
              Import
            </Button>
            <Button variant="outline" className="rounded-xl gap-2">
              <Download className="size-4" />
              Export
            </Button>
            <Button className="rounded-xl gap-2 shadow-brand" onClick={handleAdd}>
              <Plus className="size-4" />
              Add Product
            </Button>
          </>
        }
      />

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name or SKU…"
        >
          <div className="flex flex-wrap gap-2">
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => {
                setCategoryFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 h-10 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData?.data.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={lowStockOnly || "all"}
              onValueChange={(value) => {
                setLowStockOnly(value === "all" ? "" : "1");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="1">Low Stock</SelectItem>
              </SelectContent>
            </Select>

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
          </div>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada produk."
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

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />

      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk "{deletingProduct?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
