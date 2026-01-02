import { useQuery } from "@tanstack/react-query";
import {
  reportsApi,
  type COGSReport,
  type IncomeStatement,
  type ProfitSummary,
  type DashboardSummary,
  type ChartDataResponse,
} from "~/lib/api";
import { useAuthStore } from "~/stores/authStore";

// Query keys for cache management
export const reportKeys = {
  all: ["reports"] as const,
  cogs: () => [...reportKeys.all, "cogs"] as const,
  cogsWithDate: (startDate?: string, endDate?: string) =>
    [...reportKeys.cogs(), { startDate, endDate }] as const,
  income: () => [...reportKeys.all, "income"] as const,
  incomeWithDate: (startDate?: string, endDate?: string) =>
    [...reportKeys.income(), { startDate, endDate }] as const,
  profit: () => [...reportKeys.all, "profit"] as const,
  profitWithDate: (startDate?: string, endDate?: string) =>
    [...reportKeys.profit(), { startDate, endDate }] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  chartData: (period: "daily" | "weekly" | "monthly") =>
    [...reportKeys.all, "chart", period] as const,
};

// Fetch COGS report
export function useCOGSReport(startDate?: string, endDate?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: reportKeys.cogsWithDate(startDate, endDate),
    queryFn: () => reportsApi.getCOGS(startDate, endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch income statement
export function useIncomeStatement(startDate?: string, endDate?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: reportKeys.incomeWithDate(startDate, endDate),
    queryFn: () => reportsApi.getIncomeStatement(startDate, endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch profit summary
export function useProfitSummary(startDate?: string, endDate?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: reportKeys.profitWithDate(startDate, endDate),
    queryFn: () => reportsApi.getProfitSummary(startDate, endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch dashboard summary
export function useDashboardSummary() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: () => reportsApi.getDashboard(),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch chart data for revenue & expenses overview
export function useChartData(period: "daily" | "weekly" | "monthly" = "daily") {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: reportKeys.chartData(period),
    queryFn: () => reportsApi.getChartData(period),
    enabled: isAuthenticated && !isAuthLoading,
  });
}
