import { apiClient, type ApiSuccess } from "@/lib/api-client";
import type { DashboardResponse } from "@/types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<ApiSuccess<DashboardResponse>>("/dashboard");
  return data.data;
}
