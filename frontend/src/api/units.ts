import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Unit, UnitListParams, UnitPayload } from "@/types/unit";
import type { PaginatedResponse } from "@/types/common";

export async function listUnits(params: UnitListParams): Promise<PaginatedResponse<Unit>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Unit>>("/units", { params });
  return { data: data.data, meta: data.meta };
}

export async function createUnit(payload: UnitPayload): Promise<Unit> {
  const { data } = await apiClient.post<ApiSuccess<Unit>>("/units", payload);
  return data.data;
}

export async function updateUnit(id: number, payload: UnitPayload): Promise<Unit> {
  const { data } = await apiClient.put<ApiSuccess<Unit>>(`/units/${id}`, payload);
  return data.data;
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient.delete(`/units/${id}`);
}
