import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Warehouse, WarehouseListParams, WarehousePayload } from "@/types/warehouse";
import type { PaginatedResponse } from "@/types/common";

export async function listWarehouses(
  params: WarehouseListParams,
): Promise<PaginatedResponse<Warehouse>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Warehouse>>("/warehouses", { params });
  return { data: data.data, meta: data.meta };
}

export async function createWarehouse(payload: WarehousePayload): Promise<Warehouse> {
  const { data } = await apiClient.post<ApiSuccess<Warehouse>>("/warehouses", payload);
  return data.data;
}

export async function updateWarehouse(id: number, payload: WarehousePayload): Promise<Warehouse> {
  const { data } = await apiClient.put<ApiSuccess<Warehouse>>(`/warehouses/${id}`, payload);
  return data.data;
}

export async function deleteWarehouse(id: number): Promise<void> {
  await apiClient.delete(`/warehouses/${id}`);
}
