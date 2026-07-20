import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from "@/api/suppliers";
import type { SupplierListParams, SupplierPayload } from "@/types/supplier";

const SUPPLIERS_KEY = ["suppliers"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useSuppliers(params: SupplierListParams) {
  return useQuery({
    queryKey: [...SUPPLIERS_KEY, params],
    queryFn: () => listSuppliers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      toast.success("Supplier berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat supplier")),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupplierPayload }) =>
      updateSupplier(id, payload),
    onSuccess: () => {
      toast.success("Supplier berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui supplier")),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      toast.success("Supplier berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus supplier")),
  });
}
