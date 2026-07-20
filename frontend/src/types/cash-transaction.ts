export type CashTransactionType = "in" | "out";
export type CashTransactionCategory = "income" | "deposit" | "expense" | "withdrawal" | "other";

export type CashTransaction = {
  id: number;
  reference_number: string;
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
  sort?: "reference_number" | "type" | "amount" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
};

export type CashTransactionPayload = {
  type: CashTransactionType;
  category: CashTransactionCategory;
  amount: number;
  description: string;
};
