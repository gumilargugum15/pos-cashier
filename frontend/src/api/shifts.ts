import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type {
  CloseShiftPayload,
  CurrentDrawer,
  OpenShiftPayload,
  Shift,
  ShiftListParams,
} from "@/types/shift";
import type { PaginatedResponse } from "@/types/common";

export async function listShifts(params: ShiftListParams): Promise<PaginatedResponse<Shift>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Shift>>("/shifts", { params });
  return { data: data.data, meta: data.meta };
}

export async function openShift(payload: OpenShiftPayload): Promise<Shift> {
  const { data } = await apiClient.post<ApiSuccess<Shift>>("/shifts", payload);
  return data.data;
}

export async function getCurrentDrawer(): Promise<CurrentDrawer> {
  const { data } = await apiClient.get<ApiSuccess<CurrentDrawer>>("/shifts/current");
  return data.data;
}

export async function closeShift(id: number, payload: CloseShiftPayload): Promise<Shift> {
  const { data } = await apiClient.post<ApiSuccess<Shift>>(`/shifts/${id}/close`, payload);
  return data.data;
}
