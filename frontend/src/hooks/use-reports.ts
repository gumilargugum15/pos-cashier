import { useQuery } from "@tanstack/react-query";
import {
  getBestSellingReport,
  getCustomerReport,
  getInventoryReport,
  getProfitReport,
  getPurchasesReport,
  getSalesReport,
  getStockMovementReport,
  getSupplierReport,
  getTaxReport,
} from "@/api/reports";
import type { ReportDateRangeParams } from "@/types/report";

export function useSalesReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "sales", params],
    queryFn: () => getSalesReport(params),
  });
}

export function usePurchasesReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "purchases", params],
    queryFn: () => getPurchasesReport(params),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: () => getInventoryReport(),
  });
}

export function useProfitReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "profit", params],
    queryFn: () => getProfitReport(params),
  });
}

export function useTaxReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "tax", params],
    queryFn: () => getTaxReport(params),
  });
}

export function useCustomerReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "customers", params],
    queryFn: () => getCustomerReport(params),
  });
}

export function useSupplierReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "suppliers", params],
    queryFn: () => getSupplierReport(params),
  });
}

export function useBestSellingReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "best-selling", params],
    queryFn: () => getBestSellingReport(params),
  });
}

export function useStockMovementReport(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: ["reports", "stock-movements", params],
    queryFn: () => getStockMovementReport(params),
  });
}
