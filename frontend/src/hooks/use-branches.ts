import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBranch, deleteBranch, listBranches, updateBranch } from "@/api/branches";
import type { BranchListParams, BranchPayload } from "@/types/branch";

const BRANCHES_KEY = ["branches"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useBranches(params: BranchListParams) {
  return useQuery({
    queryKey: [...BRANCHES_KEY, params],
    queryFn: () => listBranches(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BranchPayload) => createBranch(payload),
    onSuccess: () => {
      toast.success("Cabang berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat cabang")),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BranchPayload }) =>
      updateBranch(id, payload),
    onSuccess: () => {
      toast.success("Cabang berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui cabang")),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBranch(id),
    onSuccess: () => {
      toast.success("Cabang berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus cabang")),
  });
}
