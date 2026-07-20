import { apiClient, type ApiSuccess } from "@/lib/api-client";
import type { Settings, SettingsPayload } from "@/types/settings";

export async function getSettings(): Promise<Settings> {
  const { data } = await apiClient.get<ApiSuccess<Settings>>("/settings");
  return data.data;
}

export async function updateSettings(payload: SettingsPayload): Promise<Settings> {
  const { data } = await apiClient.put<ApiSuccess<Settings>>("/settings", payload);
  return data.data;
}
