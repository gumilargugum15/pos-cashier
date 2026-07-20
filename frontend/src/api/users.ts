import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { User } from "@/types/auth";
import type { UserListParams, UserPayload } from "@/types/user";
import type { PaginatedResponse } from "@/types/common";

export async function listUsers(params: UserListParams): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<User>>("/users", { params });
  return { data: data.data, meta: data.meta };
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiSuccess<User>>("/users", payload);
  return data.data;
}

export async function updateUser(id: number, payload: UserPayload): Promise<User> {
  const { data } = await apiClient.put<ApiSuccess<User>>(`/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
