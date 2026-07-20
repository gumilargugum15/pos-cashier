import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "@/api/customers";
import type { CustomerListParams, CustomerPayload } from "@/types/customer";

const CUSTOMERS_KEY = ["customers"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, params],
    queryFn: () => listCustomers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      toast.success("Customer berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat customer")),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerPayload }) =>
      updateCustomer(id, payload),
    onSuccess: () => {
      toast.success("Customer berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui customer")),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      toast.success("Customer berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus customer")),
  });
}
