import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/api/settings";
import type { SettingsPayload } from "@/types/settings";

const SETTINGS_KEY = ["settings"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SettingsPayload) => updateSettings(payload),
    onSuccess: () => {
      toast.success("Pengaturan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui pengaturan")),
  });
}
