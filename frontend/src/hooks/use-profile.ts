import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePassword, updateProfile } from "@/api/auth";
import { useAuth } from "@/hooks/use-auth";
import type { ChangePasswordPayload, UpdateProfilePayload } from "@/types/auth";

function extractErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return message ?? fallback;
}

export function useUpdateProfile() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (user) => {
      updateUser(user);
      toast.success("Profil berhasil diperbarui");
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui profil")),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => toast.success("Password berhasil diubah"),
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mengubah password")),
  });
}
