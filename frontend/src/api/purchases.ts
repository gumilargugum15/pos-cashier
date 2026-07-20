import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Purchase, PurchaseListParams, PurchasePayload } from "@/types/purchase";
import type { PaginatedResponse } from "@/types/common";

export async function listPurchases(
  params: PurchaseListParams,
): Promise<PaginatedResponse<Purchase>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Purchase>>("/purchases", { params });
  return { data: data.data, meta: data.meta };
}

export async function createPurchase(payload: PurchasePayload): Promise<Purchase> {
  const { data } = await apiClient.post<ApiSuccess<Purchase>>("/purchases", payload);
  return data.data;
}

export async function updatePurchase(id: number, payload: PurchasePayload): Promise<Purchase> {
  const { data } = await apiClient.put<ApiSuccess<Purchase>>(`/purchases/${id}`, payload);
  return data.data;
}

export async function deletePurchase(id: number): Promise<void> {
  await apiClient.delete(`/purchases/${id}`);
}

export async function receivePurchase(id: number): Promise<Purchase> {
  const { data } = await apiClient.post<ApiSuccess<Purchase>>(`/purchases/${id}/receive`);
  return data.data;
}

export async function cancelPurchase(id: number): Promise<Purchase> {
  const { data } = await apiClient.post<ApiSuccess<Purchase>>(`/purchases/${id}/cancel`);
  return data.data;
}

export async function payPurchase(id: number, amount: number): Promise<Purchase> {
  const { data } = await apiClient.post<ApiSuccess<Purchase>>(`/purchases/${id}/pay`, { amount });
  return data.data;
}
