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

type CustomerFilterComboboxProps = {
  value: { id: number; name: string } | null;
  onChange: (customer: { id: number; name: string } | null) => void;
};

export function CustomerFilterCombobox({ value, onChange }: CustomerFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useCustomers({
    search: debouncedQuery || undefined,
    per_page: 20,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 w-48 justify-between rounded-xl">
          <span className="flex min-w-0 items-center gap-2">
            <User className="size-4 text-primary shrink-0" />
            <span className="truncate">{value ? value.name : "Semua Customer"}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
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
                Semua Customer
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
