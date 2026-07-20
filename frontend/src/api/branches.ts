import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Branch, BranchListParams, BranchPayload } from "@/types/branch";
import type { PaginatedResponse } from "@/types/common";

export async function listBranches(params: BranchListParams): Promise<PaginatedResponse<Branch>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Branch>>("/branches", { params });
  return { data: data.data, meta: data.meta };
}

export async function createBranch(payload: BranchPayload): Promise<Branch> {
  const { data } = await apiClient.post<ApiSuccess<Branch>>("/branches", payload);
  return data.data;
}

export async function updateBranch(id: number, payload: BranchPayload): Promise<Branch> {
  const { data } = await apiClient.put<ApiSuccess<Branch>>(`/branches/${id}`, payload);
  return data.data;
}

export async function deleteBranch(id: number): Promise<void> {
  await apiClient.delete(`/branches/${id}`);
}
