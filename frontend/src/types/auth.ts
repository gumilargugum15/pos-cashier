export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string | null;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};
