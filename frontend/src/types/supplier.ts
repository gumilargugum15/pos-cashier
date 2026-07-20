export type Supplier = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type SupplierListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  sort?: "name" | "contact_person" | "phone" | "email" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SupplierPayload = {
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
};
