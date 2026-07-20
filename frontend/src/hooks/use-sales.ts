import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkout, listSales, refundSale } from "@/api/sales";
import type { CheckoutPayload, SaleListParams } from "@/types/sale";

const SALES_KEY = ["sales"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
    },
  });
}

export function useSales(params: SaleListParams) {
  return useQuery({
    queryKey: [...SALES_KEY, params],
    queryFn: () => listSales(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useRefundSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => refundSale(id),
    onSuccess: () => {
      toast.success("Transaksi berhasil direfund");
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal melakukan refund")),
  });
}

export { extractErrorMessage };
