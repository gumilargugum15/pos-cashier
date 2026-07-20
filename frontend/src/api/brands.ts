import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Brand, BrandListParams, BrandPayload } from "@/types/brand";
import type { PaginatedResponse } from "@/types/common";

export async function listBrands(params: BrandListParams): Promise<PaginatedResponse<Brand>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Brand>>("/brands", { params });
  return { data: data.data, meta: data.meta };
}

export async function createBrand(payload: BrandPayload): Promise<Brand> {
  const { data } = await apiClient.post<ApiSuccess<Brand>>("/brands", payload);
  return data.data;
}

export async function updateBrand(id: number, payload: BrandPayload): Promise<Brand> {
  const { data } = await apiClient.put<ApiSuccess<Brand>>(`/brands/${id}`, payload);
  return data.data;
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/brands/${id}`);
}
