import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createStockMovementColumns } from "@/components/inventory/stock-movement-columns";
import { TransferStockDialog } from "@/components/inventory/transfer-stock-dialog";
import { useStockMovements } from "@/hooks/use-stock-movements";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useActiveBranch } from "@/hooks/use-active-branch";
import type { StockMovementListParams } from "@/types/stock-movement";

export const Route = createFileRoute("/transfer-stock")({
  head: () => ({
    meta: [{ title: "Transfer Stock · Nova POS" }],
  }),
  component: TransferStockPage,
});

function TransferStockPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);
  const { effectiveBranchId } = useActiveBranch();

  const params: StockMovementListParams = {
    search: debouncedSearch || undefined,
    type: "transfer",
    branch_id: effectiveBranchId ?? undefined,
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
        title="Transfer Stock"
        description="Pindahkan stok antar gudang."
        crumbs={[{ label: "Home", to: "/" }, { label: "Transfer Stock" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Buat Transfer
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
        />

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Belum ada transfer stok."
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

      <TransferStockDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
