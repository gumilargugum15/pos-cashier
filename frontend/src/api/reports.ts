import { apiClient, type ApiSuccess } from "@/lib/api-client";
import type {
  BestSellingReport,
  CustomerReport,
  InventoryReport,
  ProfitReport,
  PurchasesReport,
  ReportDateRangeParams,
  SalesReport,
  StockMovementReport,
  SupplierReport,
  TaxReport,
} from "@/types/report";

export async function getSalesReport(params: ReportDateRangeParams): Promise<SalesReport> {
  const { data } = await apiClient.get<ApiSuccess<SalesReport>>("/reports/sales", { params });
  return data.data;
}

export async function getPurchasesReport(params: ReportDateRangeParams): Promise<PurchasesReport> {
  const { data } = await apiClient.get<ApiSuccess<PurchasesReport>>("/reports/purchases", {
    params,
  });
  return data.data;
}

export async function getInventoryReport(): Promise<InventoryReport> {
  const { data } = await apiClient.get<ApiSuccess<InventoryReport>>("/reports/inventory");
  return data.data;
}

export async function getProfitReport(params: ReportDateRangeParams): Promise<ProfitReport> {
  const { data } = await apiClient.get<ApiSuccess<ProfitReport>>("/reports/profit", { params });
  return data.data;
}

export async function getTaxReport(params: ReportDateRangeParams): Promise<TaxReport> {
  const { data } = await apiClient.get<ApiSuccess<TaxReport>>("/reports/tax", { params });
  return data.data;
}

export async function getCustomerReport(params: ReportDateRangeParams): Promise<CustomerReport> {
  const { data } = await apiClient.get<ApiSuccess<CustomerReport>>("/reports/customers", {
    params,
  });
  return data.data;
}

export async function getSupplierReport(params: ReportDateRangeParams): Promise<SupplierReport> {
  const { data } = await apiClient.get<ApiSuccess<SupplierReport>>("/reports/suppliers", {
    params,
  });
  return data.data;
}

export async function getBestSellingReport(
  params: ReportDateRangeParams,
): Promise<BestSellingReport> {
  const { data } = await apiClient.get<ApiSuccess<BestSellingReport>>("/reports/best-selling", {
    params,
  });
  return data.data;
}

export async function getStockMovementReport(
  params: ReportDateRangeParams,
): Promise<StockMovementReport> {
  const { data } = await apiClient.get<ApiSuccess<StockMovementReport>>(
    "/reports/stock-movements",
    {
      params,
    },
  );
  return data.data;
}
