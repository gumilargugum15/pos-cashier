export type Category = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export type CategoryListParams = {
  search?: string;
  is_active?: "" | "0" | "1";
  sort?: "name" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type CategoryPayload = {
  name: string;
  slug?: string;
  is_active?: boolean;
};
