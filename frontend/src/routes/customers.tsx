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
import { createCustomerColumns } from "@/components/customers/customer-columns";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Customer, CustomerListParams } from "@/types/customer";

type CustomersSearch = {
  q?: string;
};

export const Route = createFileRoute("/customers")({
  validateSearch: (search: Record<string, unknown>): CustomersSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [{ title: "Customers · Nova POS" }],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { q } = Route.useSearch();
  const [search, setSearch] = useState(q ?? "");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const params: CustomerListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    sort: (sorting[0]?.id as CustomerListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useCustomers(params);
  const deleteCustomer = useDeleteCustomer();

  function handleAdd() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingCustomer) return;
    await deleteCustomer.mutateAsync(deletingCustomer.id);
    setDeletingCustomer(null);
  }

  const columns = createCustomerColumns({ onEdit: handleEdit, onDelete: setDeletingCustomer });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Customers"
        description="Profiles, contact details, and purchase history."
        crumbs={[{ label: "Home", to: "/" }, { label: "Customers" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Customer
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
          searchPlaceholder="Search by name, phone, or email…"
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
          emptyMessage="Belum ada customer."
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

      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editingCustomer} />

      <AlertDialog
        open={!!deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Customer "{deletingCustomer?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
