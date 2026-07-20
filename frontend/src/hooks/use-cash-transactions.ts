import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCashTransaction, listCashTransactions } from "@/api/cash-transactions";
import type { CashTransactionListParams, CashTransactionPayload } from "@/types/cash-transaction";

const CASH_TRANSACTIONS_KEY = ["cash-transactions"];
const CURRENT_DRAWER_KEY = ["current-drawer"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useCashTransactions(params: CashTransactionListParams) {
  return useQuery({
    queryKey: [...CASH_TRANSACTIONS_KEY, params],
    queryFn: () => listCashTransactions(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CashTransactionPayload) => createCashTransaction(payload),
    onSuccess: () => {
      toast.success("Transaksi kas berhasil dicatat");
      queryClient.invalidateQueries({ queryKey: CASH_TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_DRAWER_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat transaksi kas")),
  });
}
