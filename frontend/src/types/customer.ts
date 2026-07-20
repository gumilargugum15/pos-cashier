export type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type CustomerListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  sort?: "name" | "phone" | "email" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type CustomerPayload = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
};
