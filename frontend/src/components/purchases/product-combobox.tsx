import { useState } from "react";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useProducts } from "@/hooks/use-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRupiah } from "@/lib/format-currency";
import type { Product } from "@/types/product";

type ProductComboboxProps = {
  onSelect: (product: Product) => void;
};

export function ProductCombobox({ onSelect }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    is_active: "1",
    per_page: 20,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10 rounded-xl gap-2">
          <Search className="size-4" />
          Tambah Produk
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Cari produk, SKU…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{isLoading ? "Memuat…" : "Produk tidak ditemukan."}</CommandEmpty>
            <CommandGroup>
              {data?.data.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => {
                    onSelect(product);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2"
                >
                  <Package className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{product.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {product.sku} · {formatRupiah(product.cost_price)}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
