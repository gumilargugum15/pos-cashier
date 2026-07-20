export type ShiftStatus = "open" | "closed";

export type Shift = {
  id: number;
  user_name: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  variance: number | null;
  status: ShiftStatus;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
};

export type ShiftLiveSummary = {
  cash_sales: number;
  cash_in_total: number;
  cash_out_total: number;
  expected_balance: number;
};

export type CurrentDrawer = {
  shift: Shift | null;
  live: ShiftLiveSummary | null;
};

export type ShiftListParams = {
  user_id?: number | "";
  status?: "" | ShiftStatus;
  sort?: "opened_at" | "closed_at" | "status" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type OpenShiftPayload = {
  opening_balance: number;
  notes?: string | null;
};

export type CloseShiftPayload = {
  closing_balance: number;
  notes?: string | null;
};
