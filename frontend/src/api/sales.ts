import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { CheckoutPayload, Sale, SaleListParams } from "@/types/sale";
import type { PaginatedResponse } from "@/types/common";

export async function checkout(payload: CheckoutPayload): Promise<Sale> {
  const { data } = await apiClient.post<ApiSuccess<Sale>>("/sales", payload);
  return data.data;
}

export async function listSales(params: SaleListParams): Promise<PaginatedResponse<Sale>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Sale>>("/sales", { params });
  return { data: data.data, meta: data.meta };
}

export async function getSale(id: number): Promise<Sale> {
  const { data } = await apiClient.get<ApiSuccess<Sale>>(`/sales/${id}`);
  return data.data;
}

export async function refundSale(id: number): Promise<Sale> {
  const { data } = await apiClient.post<ApiSuccess<Sale>>(`/sales/${id}/refund`);
  return data.data;
}
