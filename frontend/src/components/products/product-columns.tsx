import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format-currency";
import type { Product } from "@/types/product";

type ProductColumnHandlers = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function createProductColumns({
  onEdit,
  onDelete,
}: ProductColumnHandlers): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image_url ? (
            <img
              src={row.original.image_url}
              alt=""
              className="size-10 rounded-xl bg-muted object-cover"
            />
          ) : (
            <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Package className="size-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold truncate">{row.original.name}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.brand_name}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
    },
    {
      accessorKey: "category_name",
      header: "Category",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-md">
          {row.original.category_name}
        </Badge>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span className={cn("font-semibold", row.original.is_low_stock && "text-danger")}>
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: "cost_price",
      header: "Cost",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatRupiah(row.original.cost_price)}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-semibold">{formatRupiah(row.original.price)}</span>,
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
          {row.original.is_active ? "Active" : "Inactive"}
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
