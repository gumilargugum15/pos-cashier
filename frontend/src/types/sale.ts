export type PaymentMethod = "cash" | "debit" | "credit_card" | "transfer" | "qris" | "e_wallet";

export type SaleItem = {
  id: number;
  product_id: number;
  product_name: string;
  qty: number;
  price: number;
  discount_amount: number;
  tax_amount: number;
  subtotal: number;
};

export type Sale = {
  id: number;
  invoice_number: string;
  customer: { id: number; name: string } | null;
  cashier_name: string | null;
  items: SaleItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  status: "paid" | "refunded" | "void" | "pending";
  created_at: string;
};

export type CheckoutPayload = {
  customer_id?: number | null;
  items: { product_id: number; qty: number }[];
  payment_method: PaymentMethod;
  paid_amount: number;
};

export type SaleListParams = {
  search?: string;
  status?: "" | Sale["status"];
  payment_method?: "" | PaymentMethod;
  customer_id?: number | "";
  sort?: "invoice_number" | "grand_total" | "status" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};
