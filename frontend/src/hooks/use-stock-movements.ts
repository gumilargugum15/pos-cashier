import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createStockMovement, listStockMovements } from "@/api/stock-movements";
import type { StockMovementListParams, StockMovementPayload } from "@/types/stock-movement";

const STOCK_MOVEMENTS_KEY = ["stock-movements"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useStockMovements(params: StockMovementListParams) {
  return useQuery({
    queryKey: [...STOCK_MOVEMENTS_KEY, params],
    queryFn: () => listStockMovements(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementPayload) => createStockMovement(payload),
    onSuccess: () => {
      toast.success("Pergerakan stok berhasil dicatat");
      queryClient.invalidateQueries({ queryKey: STOCK_MOVEMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat pergerakan stok")),
  });
}
