import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
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
import { useCustomers } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Customer } from "@/types/customer";

type CustomerComboboxProps = {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
};

export function CustomerCombobox({ value, onChange }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useCustomers({
    search: debouncedQuery || undefined,
    is_active: "1",
    per_page: 20,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="hidden md:flex h-10 rounded-xl gap-2">
          <User className="size-4" />
          <span className="max-w-32 truncate">{value ? value.name : "Walk-in"}</span>
          <ChevronDown className="size-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Cari customer…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{isLoading ? "Memuat…" : "Customer tidak ditemukan."}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Walk-in (tanpa customer)
              </CommandItem>
              {data?.data.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => {
                    onChange(customer);
                    setOpen(false);
                  }}
                >
                  {customer.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
