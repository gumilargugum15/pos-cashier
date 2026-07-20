import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type {
  StockMovement,
  StockMovementListParams,
  StockMovementPayload,
} from "@/types/stock-movement";
import type { PaginatedResponse } from "@/types/common";

export async function listStockMovements(
  params: StockMovementListParams,
): Promise<PaginatedResponse<StockMovement>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<StockMovement>>("/stock-movements", {
    params,
  });
  return { data: data.data, meta: data.meta };
}

export async function createStockMovement(payload: StockMovementPayload): Promise<StockMovement> {
  const { data } = await apiClient.post<ApiSuccess<StockMovement>>("/stock-movements", payload);
  return data.data;
}
