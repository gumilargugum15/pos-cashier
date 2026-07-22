import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DrawerSummaryCard } from "@/components/finance/drawer-summary-card";
import { OpenShiftDialog } from "@/components/finance/open-shift-dialog";
import { CloseShiftDialog } from "@/components/finance/close-shift-dialog";
import { CashTransactionDialog } from "@/components/finance/cash-transaction-dialog";
import { createShiftColumns } from "@/components/finance/shift-columns";
import { createCashTransactionColumns } from "@/components/finance/cash-transaction-columns";
import { useCurrentDrawer, useShifts } from "@/hooks/use-shifts";
import { useCashTransactions } from "@/hooks/use-cash-transactions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useActiveBranch } from "@/hooks/use-active-branch";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [{ title: "Finance · Nova POS" }],
  }),
  component: FinancePage,
});

function FinancePage() {
  const [openShiftDialogOpen, setOpenShiftDialogOpen] = useState(false);
  const [closeShiftDialogOpen, setCloseShiftDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const { data: drawer } = useCurrentDrawer();
  const { effectiveBranchId } = useActiveBranch();

  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [txSorting, setTxSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const debouncedTxSearch = useDebouncedValue(txSearch, 400);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useCashTransactions({
    search: debouncedTxSearch || undefined,
    branch_id: effectiveBranchId ?? undefined,
    sort: (txSorting[0]?.id as never) ?? "created_at",
    direction: txSorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page: txPage,
  });

  const [shiftPage, setShiftPage] = useState(1);
  const [shiftSorting, setShiftSorting] = useState<SortingState>([{ id: "opened_at", desc: true }]);

  const {
    data: shiftsData,
    isLoading: shiftsLoading,
    isError: shiftsError,
  } = useShifts({
    branch_id: effectiveBranchId ?? undefined,
    sort: (shiftSorting[0]?.id as never) ?? "opened_at",
    direction: shiftSorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page: shiftPage,
  });

  const transactionColumns = createCashTransactionColumns();
  const shiftColumns = createShiftColumns();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <PageHeader
        title="Finance"
        description="Kas masuk/keluar, shift kasir, dan rekonsiliasi laci kas."
        crumbs={[{ label: "Home", to: "/" }, { label: "Finance" }]}
      />

      <DrawerSummaryCard
        shift={drawer?.shift ?? null}
        live={drawer?.live ?? null}
        onOpenShift={() => setOpenShiftDialogOpen(true)}
        onCloseShift={() => setCloseShiftDialogOpen(true)}
        onRecordTransaction={() => setTransactionDialogOpen(true)}
      />

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Riwayat Kas</TabsTrigger>
          <TabsTrigger value="shifts">Riwayat Shift</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="rounded-2xl shadow-soft overflow-hidden">
            <DataTableToolbar
              searchValue={txSearch}
              onSearchChange={(value) => {
                setTxSearch(value);
                setTxPage(1);
              }}
              searchPlaceholder="Cari no. referensi…"
            />
            <DataTable
              columns={transactionColumns}
              data={transactionsData?.data ?? []}
              isLoading={transactionsLoading}
              isError={transactionsError}
              emptyMessage="Belum ada transaksi kas."
              sorting={txSorting}
              onSortingChange={(updater) => {
                setTxSorting(updater);
                setTxPage(1);
              }}
            />
            {transactionsData && transactionsData.meta.total > 0 && (
              <DataTablePagination
                page={transactionsData.meta.current_page}
                lastPage={transactionsData.meta.last_page}
                total={transactionsData.meta.total}
                perPage={transactionsData.meta.per_page}
                onPageChange={setTxPage}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="shifts">
          <Card className="rounded-2xl shadow-soft overflow-hidden">
            <DataTable
              columns={shiftColumns}
              data={shiftsData?.data ?? []}
              isLoading={shiftsLoading}
              isError={shiftsError}
              emptyMessage="Belum ada riwayat shift."
              sorting={shiftSorting}
              onSortingChange={(updater) => {
                setShiftSorting(updater);
                setShiftPage(1);
              }}
            />
            {shiftsData && shiftsData.meta.total > 0 && (
              <DataTablePagination
                page={shiftsData.meta.current_page}
                lastPage={shiftsData.meta.last_page}
                total={shiftsData.meta.total}
                perPage={shiftsData.meta.per_page}
                onPageChange={setShiftPage}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <OpenShiftDialog open={openShiftDialogOpen} onOpenChange={setOpenShiftDialogOpen} />
      <CloseShiftDialog
        open={closeShiftDialogOpen}
        onOpenChange={setCloseShiftDialogOpen}
        shift={drawer?.shift ?? null}
        live={drawer?.live ?? null}
      />
      <CashTransactionDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
    </div>
  );
}
