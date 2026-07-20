import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Supplier, SupplierListParams, SupplierPayload } from "@/types/supplier";
import type { PaginatedResponse } from "@/types/common";

export async function listSuppliers(
  params: SupplierListParams,
): Promise<PaginatedResponse<Supplier>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Supplier>>("/suppliers", { params });
  return { data: data.data, meta: data.meta };
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const { data } = await apiClient.post<ApiSuccess<Supplier>>("/suppliers", payload);
  return data.data;
}

export async function updateSupplier(id: number, payload: SupplierPayload): Promise<Supplier> {
  const { data } = await apiClient.put<ApiSuccess<Supplier>>(`/suppliers/${id}`, payload);
  return data.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}
