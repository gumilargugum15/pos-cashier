import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Category, CategoryListParams, CategoryPayload } from "@/types/category";
import type { PaginatedResponse } from "@/types/common";

export async function listCategories(
  params: CategoryListParams,
): Promise<PaginatedResponse<Category>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Category>>("/categories", { params });
  return { data: data.data, meta: data.meta };
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<ApiSuccess<Category>>("/categories", payload);
  return data.data;
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.put<ApiSuccess<Category>>(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
