import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Package, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { navGroups } from "@/components/app-sidebar";
import { listCustomers } from "@/api/customers";
import { listProducts } from "@/api/products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRupiah } from "@/lib/format-currency";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const hasQuery = debouncedQuery.trim().length > 0;

  const { data: productResults } = useQuery({
    queryKey: ["command-palette-products", debouncedQuery],
    queryFn: () => listProducts({ search: debouncedQuery, per_page: 5 }),
    enabled: open && hasQuery,
  });

  const { data: customerResults } = useQuery({
    queryKey: ["command-palette-customers", debouncedQuery],
    queryFn: () => listCustomers({ search: debouncedQuery, per_page: 5 }),
    enabled: open && hasQuery,
  });

  function go(to: string, search?: Record<string, string>) {
    navigate({ to, search });
    onOpenChange(false);
  }

  const filteredNav = navGroups
    .flatMap((group) => group.items)
    .filter((item) => !hasQuery || item.title.toLowerCase().includes(debouncedQuery.toLowerCase()));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search products, customers, orders…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        {productResults && productResults.data.length > 0 && (
          <CommandGroup heading="Produk">
            {productResults.data.map((product) => (
              <CommandItem
                key={`product-${product.id}`}
                value={`product-${product.id}-${product.name}`}
                onSelect={() => go("/products", { q: product.name })}
              >
                <Package />
                <div className="flex flex-1 flex-col">
                  <span>{product.name}</span>
                  <span className="text-xs text-muted-foreground">SKU {product.sku}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatRupiah(product.price)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {customerResults && customerResults.data.length > 0 && (
          <CommandGroup heading="Customer">
            {customerResults.data.map((customer) => (
              <CommandItem
                key={`customer-${customer.id}`}
                value={`customer-${customer.id}-${customer.name}`}
                onSelect={() => go("/customers", { q: customer.name })}
              >
                <Users />
                <div className="flex flex-1 flex-col">
                  <span>{customer.name}</span>
                  {customer.phone && (
                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(productResults && productResults.data.length > 0) ||
        (customerResults && customerResults.data.length > 0) ? (
          <CommandSeparator />
        ) : null}

        <CommandGroup heading="Halaman">
          {filteredNav.map((item) => (
            <CommandItem
              key={item.url}
              value={`page-${item.url}-${item.title}`}
              onSelect={() => go(item.url)}
            >
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
