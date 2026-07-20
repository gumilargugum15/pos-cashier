import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/api/categories";
import type { CategoryListParams, CategoryPayload } from "@/types/category";

const CATEGORIES_KEY = ["categories"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, params],
    queryFn: () => listCategories(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Kategori berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat kategori")),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Kategori berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui kategori")),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus kategori")),
  });
}
