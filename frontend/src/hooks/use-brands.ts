import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBrand, deleteBrand, listBrands, updateBrand } from "@/api/brands";
import type { BrandListParams, BrandPayload } from "@/types/brand";

const BRANDS_KEY = ["brands"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useBrands(params: BrandListParams) {
  return useQuery({
    queryKey: [...BRANDS_KEY, params],
    queryFn: () => listBrands(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BrandPayload) => createBrand(payload),
    onSuccess: () => {
      toast.success("Brand berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat brand")),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BrandPayload }) =>
      updateBrand(id, payload),
    onSuccess: () => {
      toast.success("Brand berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui brand")),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      toast.success("Brand berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus brand")),
  });
}
