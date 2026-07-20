import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { closeShift, getCurrentDrawer, listShifts, openShift } from "@/api/shifts";
import type { CloseShiftPayload, OpenShiftPayload, ShiftListParams } from "@/types/shift";

const SHIFTS_KEY = ["shifts"];
const CURRENT_DRAWER_KEY = ["current-drawer"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useShifts(params: ShiftListParams) {
  return useQuery({
    queryKey: [...SHIFTS_KEY, params],
    queryFn: () => listShifts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCurrentDrawer() {
  return useQuery({
    queryKey: CURRENT_DRAWER_KEY,
    queryFn: () => getCurrentDrawer(),
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OpenShiftPayload) => openShift(payload),
    onSuccess: () => {
      toast.success("Shift berhasil dibuka");
      queryClient.invalidateQueries({ queryKey: SHIFTS_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_DRAWER_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuka shift")),
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CloseShiftPayload }) =>
      closeShift(id, payload),
    onSuccess: () => {
      toast.success("Shift berhasil ditutup");
      queryClient.invalidateQueries({ queryKey: SHIFTS_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_DRAWER_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menutup shift")),
  });
}
