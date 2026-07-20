export type StockMovementType = "in" | "out" | "adjustment" | "transfer";

export type StockMovement = {
  id: number;
  reference_number: string;
  product: { id: number; name: string; sku: string } | null;
  type: StockMovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  warehouse: { id: number; name: string } | null;
  from_warehouse: { id: number; name: string } | null;
  to_warehouse: { id: number; name: string } | null;
  reason: string | null;
  user_name: string | null;
  created_at: string;
};

export type StockMovementListParams = {
  search?: string;
  type?: "" | StockMovementType;
  product_id?: number | "";
  warehouse_id?: number | "";
  sort?: "reference_number" | "type" | "quantity" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type StockMovementPayload = {
  product_id: number;
  type: StockMovementType;
  quantity?: number;
  new_stock?: number;
  warehouse_id?: number | null;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  reason?: string | null;
};
