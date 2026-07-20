import { apiClient, type ApiSuccess } from "@/lib/api-client";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiSuccess<LoginResponse>>("/auth/login", payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post("/auth/forgot-password", payload);
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post("/auth/reset-password", payload);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.put<ApiSuccess<User>>("/auth/profile", payload);
  return data.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put("/auth/change-password", payload);
}
