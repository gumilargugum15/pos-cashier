import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@/api/products";
import type { ProductListParams, ProductPayload } from "@/types/product";

const PRODUCTS_KEY = ["products"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => listProducts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => {
      toast.success("Produk berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat produk")),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Produk berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui produk")),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Produk berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus produk")),
  });
}
