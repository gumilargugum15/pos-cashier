export type Brand = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type BrandListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  sort?: "name" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type BrandPayload = {
  name: string;
  is_active?: boolean;
};
