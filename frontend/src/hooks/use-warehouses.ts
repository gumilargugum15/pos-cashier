import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createWarehouse,
  deleteWarehouse,
  listWarehouses,
  updateWarehouse,
} from "@/api/warehouses";
import type { WarehouseListParams, WarehousePayload } from "@/types/warehouse";

const WAREHOUSES_KEY = ["warehouses"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useWarehouses(params: WarehouseListParams) {
  return useQuery({
    queryKey: [...WAREHOUSES_KEY, params],
    queryFn: () => listWarehouses(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WarehousePayload) => createWarehouse(payload),
    onSuccess: () => {
      toast.success("Gudang berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat gudang")),
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WarehousePayload }) =>
      updateWarehouse(id, payload),
    onSuccess: () => {
      toast.success("Gudang berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui gudang")),
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWarehouse(id),
    onSuccess: () => {
      toast.success("Gudang berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus gudang")),
  });
}
