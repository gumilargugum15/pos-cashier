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
import type { Warehouse } from "@/types/warehouse";

type WarehouseColumnHandlers = {
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
};

export function createWarehouseColumns({
  onEdit,
  onDelete,
}: WarehouseColumnHandlers): ColumnDef<Warehouse>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "phone",
      header: "Telepon",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone ?? "—"}</span>,
    },
    {
      accessorKey: "address",
      header: "Alamat",
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-52 block">
          {row.original.address ?? "—"}
        </span>
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
