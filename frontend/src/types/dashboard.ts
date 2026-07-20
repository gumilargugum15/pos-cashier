export type DashboardStats = {
  today_sales: number;
  today_sales_change_percent: number | null;
  today_profit: number;
  today_profit_change_percent: number | null;
  transactions_count: number;
  transactions_change_percent: number | null;
  products_count: number;
  customers_count: number;
  low_stock_count: number;
  pending_orders_count: number;
  cash_in_drawer: number;
};

export type SalesTrendPoint = {
  date: string;
  day: string;
  sales: number;
  profit: number;
};

export type PaymentMethodBreakdown = {
  name: string;
  value: number;
};

export type SalesByCategoryPoint = {
  name: string;
  value: number;
};

export type TopProduct = {
  name: string;
  sold: number;
};

export type LatestTransaction = {
  id: string;
  customer: string;
  items: number;
  method: string;
  time: string;
  total: number;
  status: "Paid" | "Refunded" | "Void" | "Pending";
};

export type LowStockProduct = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  image_path: string | null;
};

export type DashboardResponse = {
  stats: DashboardStats;
  sales_trend: SalesTrendPoint[];
  payment_methods: PaymentMethodBreakdown[];
  sales_by_category: SalesByCategoryPoint[];
  top_products: TopProduct[];
  latest_transactions: LatestTransaction[];
  low_stock_products: LowStockProduct[];
};
