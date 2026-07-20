import { apiClient, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Role } from "@/types/role";
import type { PaginatedResponse } from "@/types/common";

export async function listRoles(): Promise<PaginatedResponse<Role>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Role>>("/roles", {
    params: { per_page: 100 },
  });
  return { data: data.data, meta: data.meta };
}
