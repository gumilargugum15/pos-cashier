export type Unit = {
  id: number;
  name: string;
  symbol: string;
  created_at: string;
};

export type UnitListParams = {
  search?: string;
  sort?: "name" | "symbol" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type UnitPayload = {
  name: string;
  symbol: string;
};
