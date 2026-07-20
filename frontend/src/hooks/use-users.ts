import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, deleteUser, listUsers, updateUser } from "@/api/users";
import type { UserListParams, UserPayload } from "@/types/user";

const USERS_KEY = ["users"];

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => listUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat user")),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserPayload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("User berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui user")),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("User berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus user")),
  });
}
