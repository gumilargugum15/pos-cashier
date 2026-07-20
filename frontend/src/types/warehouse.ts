export type Warehouse = {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type WarehouseListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  sort?: "name" | "code" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type WarehousePayload = {
  name: string;
  code: string;
  phone?: string | null;
  address?: string | null;
  is_active?: boolean;
};
