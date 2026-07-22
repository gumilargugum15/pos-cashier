export type CashTransactionType = "in" | "out";
export type CashTransactionCategory = "income" | "deposit" | "expense" | "withdrawal" | "other";

export type CashTransaction = {
  id: number;
  reference_number: string;
  branch_id: number | null;
  branch_name: string | null;
  shift_id: number;
  type: CashTransactionType;
  category: CashTransactionCategory;
  amount: number;
  description: string;
  user_name: string | null;
  created_at: string;
};

export type CashTransactionListParams = {
  search?: string;
  shift_id?: number | "";
  type?: "" | CashTransactionType;
  category?: "" | CashTransactionCategory;
  branch_id?: number | "";
  sort?: "reference_number" | "type" | "amount" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
};

export type CashTransactionPayload = {
  branch_id?: number | null;
  type: CashTransactionType;
  category: CashTransactionCategory;
  amount: number;
  description: string;
};
