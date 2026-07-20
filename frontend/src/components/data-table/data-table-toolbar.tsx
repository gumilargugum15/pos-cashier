import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

type DataTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
};

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari…",
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b">
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-10 rounded-xl"
        />
      </div>
      {children}
    </div>
  );
}
