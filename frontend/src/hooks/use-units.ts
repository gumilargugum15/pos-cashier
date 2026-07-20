import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUnit, deleteUnit, listUnits, updateUnit } from "@/api/units";
import type { UnitListParams, UnitPayload } from "@/types/unit";

const UNITS_KEY = ["units"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useUnits(params: UnitListParams) {
  return useQuery({
    queryKey: [...UNITS_KEY, params],
    queryFn: () => listUnits(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitPayload) => createUnit(payload),
    onSuccess: () => {
      toast.success("Unit berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat unit")),
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UnitPayload }) => updateUnit(id, payload),
    onSuccess: () => {
      toast.success("Unit berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui unit")),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUnit(id),
    onSuccess: () => {
      toast.success("Unit berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus unit")),
  });
}
