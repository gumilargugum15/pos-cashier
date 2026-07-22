export type PurchaseStatus = "ordered" | "received" | "cancelled";
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid";

export type PurchaseItem = {
  id: number;
  product_id: number;
  product_name: string;
  qty: number;
  cost_price: number;
  subtotal: number;
};

export type Purchase = {
  id: number;
  purchase_number: string;
  branch_id: number | null;
  branch_name: string | null;
  supplier: { id: number; name: string } | null;
  creator_name: string | null;
  items: PurchaseItem[];
  status: PurchaseStatus;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: PurchasePaymentStatus;
  notes: string | null;
  received_at: string | null;
  created_at: string;
};

export type PurchaseListParams = {
  search?: string;
  status?: "" | PurchaseStatus;
  payment_status?: "" | PurchasePaymentStatus;
  supplier_id?: number | "";
  branch_id?: number | "";
  sort?: "purchase_number" | "grand_total" | "status" | "payment_status" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type PurchasePayload = {
  branch_id?: number | null;
  supplier_id: number;
  items: { product_id: number; qty: number; cost_price: number }[];
  discount_percentage?: number;
  tax_percentage?: number;
  notes?: string | null;
};
