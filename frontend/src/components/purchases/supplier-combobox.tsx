import { useState } from "react";
import { ChevronDown, Truck } from "lucide-react";
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
import { useSuppliers } from "@/hooks/use-suppliers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export type SupplierOption = { id: number; name: string };

type SupplierComboboxProps = {
  value: SupplierOption | null;
  onChange: (supplier: SupplierOption) => void;
  invalid?: boolean;
};

export function SupplierCombobox({ value, onChange, invalid }: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useSuppliers({
    search: debouncedQuery || undefined,
    is_active: "1",
    per_page: 20,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("h-10 w-full justify-between rounded-xl", invalid && "border-danger")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Truck className="size-4 text-primary shrink-0" />
            <span className="truncate">{value ? value.name : "Pilih supplier…"}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Cari supplier…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{isLoading ? "Memuat…" : "Supplier tidak ditemukan."}</CommandEmpty>
            <CommandGroup>
              {data?.data.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  onSelect={() => {
                    onChange(supplier);
                    setOpen(false);
                  }}
                >
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
