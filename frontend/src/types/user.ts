export type { User } from "@/types/auth";

export type UserListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  role?: string;
  branch_id?: number | "";
  sort?: "name" | "email" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type UserPayload = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  phone?: string | null;
  branch_id?: number | null;
  is_active?: boolean;
  roles?: string[];
};
