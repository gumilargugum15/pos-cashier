import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type {
  CashTransaction,
  CashTransactionListParams,
  CashTransactionPayload,
} from "@/types/cash-transaction";
import type { PaginatedResponse } from "@/types/common";

export async function listCashTransactions(
  params: CashTransactionListParams,
): Promise<PaginatedResponse<CashTransaction>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<CashTransaction>>("/cash-transactions", {
    params,
  });
  return { data: data.data, meta: data.meta };
}

export async function createCashTransaction(
  payload: CashTransactionPayload,
): Promise<CashTransaction> {
  const { data } = await apiClient.post<ApiSuccess<CashTransaction>>("/cash-transactions", payload);
  return data.data;
}
