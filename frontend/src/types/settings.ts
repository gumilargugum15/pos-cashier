export type Settings = {
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  symbol_position: "front" | "back";
  decimal_digits: string;
  thousand_separator: string;
  decimal_separator: string;
  tax_percentage: string;
  company_name: string;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  timezone: string;
  receipt_paper_size: "58mm" | "80mm";
};

export type SettingsPayload = Partial<
  Omit<
    Settings,
    "tax_percentage" | "decimal_digits" | "company_address" | "company_phone" | "company_email"
  >
> & {
  tax_percentage?: number;
  decimal_digits?: number;
  company_address?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
};
