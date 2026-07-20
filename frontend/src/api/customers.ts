import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Customer, CustomerListParams, CustomerPayload } from "@/types/customer";
import type { PaginatedResponse } from "@/types/common";

export async function listCustomers(
  params: CustomerListParams,
): Promise<PaginatedResponse<Customer>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Customer>>("/customers", { params });
  return { data: data.data, meta: data.meta };
}

export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.post<ApiSuccess<Customer>>("/customers", payload);
  return data.data;
}

export async function updateCustomer(id: number, payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.put<ApiSuccess<Customer>>(`/customers/${id}`, payload);
  return data.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
