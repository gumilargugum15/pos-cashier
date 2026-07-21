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
import { createUserColumns } from "@/components/users/user-columns";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { useDeleteUser, useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { useBranches } from "@/hooks/use-branches";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types/auth";
import type { UserListParams } from "@/types/user";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [{ title: "Users · Nova POS" }],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: rolesData } = useRoles();
  const { data: branchesData } = useBranches({ is_active: "1", per_page: 100 });

  const params: UserListParams = {
    search: debouncedSearch || undefined,
    is_active: statusFilter || undefined,
    role: roleFilter || undefined,
    branch_id: branchFilter || undefined,
    sort: (sorting[0]?.id as UserListParams["sort"]) ?? "name",
    direction: sorting[0]?.desc ? "desc" : "asc",
    per_page: 15,
    page,
  };

  const { data, isLoading, isError } = useUsers(params);
  const deleteUser = useDeleteUser();

  function handleAdd() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingUser) return;
    await deleteUser.mutateAsync(deletingUser.id);
    setDeletingUser(null);
  }

  const columns = createUserColumns({ onEdit: handleEdit, onDelete: setDeletingUser });
  const isSelf = deletingUser && currentUser && deletingUser.id === currentUser.id;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access."
        crumbs={[{ label: "Home", to: "/" }, { label: "Users" }]}
        actions={
          <Button className="rounded-xl shadow-brand" onClick={handleAdd}>
            <Plus className="size-4" />
            Add User
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
          searchPlaceholder="Search by name or email…"
        >
          <div className="flex gap-2">
            <Select
              value={roleFilter || "all"}
              onValueChange={(value) => {
                setRoleFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {rolesData?.data.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={branchFilter ? String(branchFilter) : "all"}
              onValueChange={(value) => {
                setBranchFilter(value === "all" ? "" : Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue placeholder="Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {branchesData?.data.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </SelectItem>
                ))}
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
          emptyMessage="Belum ada user."
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              {isSelf
                ? "Anda tidak bisa menghapus akun Anda sendiri."
                : `User "${deletingUser?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            {!isSelf && <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
