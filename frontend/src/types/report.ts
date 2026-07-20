export type ReportDateRangeParams = {
  from?: string;
  to?: string;
};

export type SalesReport = {
  total: number;
  count: number;
  discount_total: number;
  tax_total: number;
  avg: number;
  by_payment_method: { method: string; count: number; total: number }[];
  by_status: { status: string; count: number; total: number }[];
  trend: { date: string; total: number; count: number }[];
};

export type PurchasesReport = {
  total: number;
  count: number;
  paid_total: number;
  outstanding_total: number;
  by_status: { status: string; count: number; total: number }[];
  by_payment_status: { payment_status: string; count: number; total: number }[];
  trend: { date: string; total: number; count: number }[];
};

export type InventoryReport = {
  total_products: number;
  total_stock_qty: number;
  total_stock_value: number;
  low_stock_count: number;
  by_category: {
    category: string;
    product_count: number;
    stock_qty: number;
    stock_value: number;
  }[];
};

export type ProfitReport = {
  revenue: number;
  cost: number;
  profit: number;
  margin_percent: number;
  trend: { date: string; revenue: number; cost: number; profit: number }[];
  by_category: { category: string; revenue: number; cost: number; profit: number }[];
};

export type TaxReport = {
  tax_collected: number;
  tax_paid: number;
  net_tax: number;
};

export type CustomerReportRow = {
  customer_id: number;
  customer_name: string;
  order_count: number;
  total_spent: number;
  avg_order_value: number;
  last_order_at: string;
};

export type CustomerReport = { rows: CustomerReportRow[] };

export type SupplierReportRow = {
  supplier_id: number;
  supplier_name: string;
  order_count: number;
  total_purchased: number;
  avg_order_value: number;
  last_order_at: string;
};

export type SupplierReport = { rows: SupplierReportRow[] };

export type BestSellingRow = {
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string | null;
  qty_sold: number;
  revenue: number;
  profit: number;
};

export type BestSellingReport = { rows: BestSellingRow[] };

export type StockMovementReport = {
  by_type: { type: string; count: number; total_quantity: number }[];
  top_products: {
    product_id: number;
    product_name: string;
    movement_count: number;
    total_quantity: number;
  }[];
  net_change: number;
};
