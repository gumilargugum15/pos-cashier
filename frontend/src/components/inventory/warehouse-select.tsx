import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarehouses } from "@/hooks/use-warehouses";

type WarehouseSelectProps = {
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  optional?: boolean;
  excludeId?: number | null;
};

export function WarehouseSelect({
  value,
  onChange,
  placeholder = "Pilih gudang",
  optional = false,
  excludeId,
}: WarehouseSelectProps) {
  const { data } = useWarehouses({ is_active: "1", per_page: 100 });
  const warehouses = (data?.data ?? []).filter((w) => w.id !== excludeId);

  return (
    <Select
      value={value ? String(value) : "none"}
      onValueChange={(val) => onChange(val === "none" ? null : Number(val))}
    >
      <SelectTrigger className="h-10 rounded-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {optional && <SelectItem value="none">Tanpa gudang</SelectItem>}
        {warehouses.map((warehouse) => (
          <SelectItem key={warehouse.id} value={String(warehouse.id)}>
            {warehouse.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
