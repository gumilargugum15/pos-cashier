import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";

type UserColumnHandlers = {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function createUserColumns({ onEdit, onDelete }: UserColumnHandlers): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      id: "roles",
      header: "Role",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length === 0 && <span className="text-muted-foreground">—</span>}
          {row.original.roles.map((role) => (
            <Badge key={role} variant="outline" className="rounded-md">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={cn(
            "rounded-md font-medium",
            row.original.is_active
              ? "bg-success/10 text-success hover:bg-success/10"
              : "bg-muted text-muted-foreground hover:bg-muted",
          )}
        >
          {row.original.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Aksi">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-danger" onClick={() => onDelete(row.original)}>
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
