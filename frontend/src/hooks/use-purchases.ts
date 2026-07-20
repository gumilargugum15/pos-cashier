import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelPurchase,
  createPurchase,
  deletePurchase,
  listPurchases,
  payPurchase,
  receivePurchase,
  updatePurchase,
} from "@/api/purchases";
import type { PurchaseListParams, PurchasePayload } from "@/types/purchase";

const PURCHASES_KEY = ["purchases"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function usePurchases(params: PurchaseListParams) {
  return useQuery({
    queryKey: [...PURCHASES_KEY, params],
    queryFn: () => listPurchases(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchasePayload) => createPurchase(payload),
    onSuccess: () => {
      toast.success("Pembelian berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat pembelian")),
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PurchasePayload }) =>
      updatePurchase(id, payload),
    onSuccess: () => {
      toast.success("Pembelian berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui pembelian")),
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePurchase(id),
    onSuccess: () => {
      toast.success("Pembelian berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus pembelian")),
  });
}

export function useReceivePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => receivePurchase(id),
    onSuccess: () => {
      toast.success("Pembelian berhasil diterima, stok produk diperbarui");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menerima pembelian")),
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelPurchase(id),
    onSuccess: () => {
      toast.success("Pembelian berhasil dibatalkan");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membatalkan pembelian")),
  });
}

export function usePayPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => payPurchase(id, amount),
    onSuccess: () => {
      toast.success("Pembayaran berhasil dicatat");
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat pembayaran")),
  });
}
