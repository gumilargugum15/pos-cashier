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
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createStockMovementColumns } from "@/components/inventory/stock-movement-columns";
import { StockInOutDialog } from "@/components/inventory/stock-in-out-dialog";
import { useStockMovements } from "@/hooks/use-stock-movements";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { StockMovementListParams } from "@/types/stock-movement";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [{ title: "Inventory · Nova POS" }],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StockMovementListParams["type"]>("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: StockMovementListParams = {
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
    sort: (sorting[0]?.id as StockMovementListParams["sort"]) ?? "created_at",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useStockMovements(params);
  const columns = createStockMovementColumns();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Inventory"
        description="Riwayat pergerakan stok — stock in, stock out, adjustment, dan transfer."
        crumbs={[{ label: "Home", to: "/" }, { label: "Inventory" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Catat Stok Masuk/Keluar
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
          searchPlaceholder="Cari no. referensi atau produk…"
        >
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => {
              setTypeFilter(value === "all" ? "" : (value as StockMovementListParams["type"]));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 h-10 rounded-xl">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="in">Stock In</SelectItem>
              <SelectItem value="out">Stock Out</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada pergerakan stok."
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

      <StockInOutDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
