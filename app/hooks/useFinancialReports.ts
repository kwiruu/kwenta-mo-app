import { useQuery } from '@tanstack/react-query';
import { financialReportsApi } from '~/lib/api';

export const financialReportKeys = {
  all: ['financial-reports'] as const,
  cogs: (startDate: string, endDate: string) =>
    [...financialReportKeys.all, 'cogs', { startDate, endDate }] as const,
  opex: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'opex', { startDate, endDate }] as const,
  variableCosts: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'variable-costs', { startDate, endDate }] as const,
  fixedCosts: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'fixed-costs', { startDate, endDate }] as const,
  salesRevenue: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'sales-revenue', { startDate, endDate }] as const,
  grossProfit: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'gross-profit', { startDate, endDate }] as const,
  operatingIncome: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'operating-income', { startDate, endDate }] as const,
  otherExpenses: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'other-expenses', { startDate, endDate }] as const,
  netProfit: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'net-profit', { startDate, endDate }] as const,
  incomeStatement: (startDate?: string, endDate?: string) =>
    [...financialReportKeys.all, 'income-statement', { startDate, endDate }] as const,
  recipeCost: (recipeId: string) => [...financialReportKeys.all, 'recipe-cost', recipeId] as const,
};

export function useFinancialCOGS(startDate: string, endDate: string) {
  return useQuery({
    queryKey: financialReportKeys.cogs(startDate, endDate),
    queryFn: () => financialReportsApi.getCOGS(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useOperatingExpenses(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.opex(startDate, endDate),
    queryFn: () => financialReportsApi.getOperatingExpenses(startDate, endDate),
  });
}

export function useVariableCosts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.variableCosts(startDate, endDate),
    queryFn: () => financialReportsApi.getVariableCosts(startDate, endDate),
  });
}

export function useFixedCosts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.fixedCosts(startDate, endDate),
    queryFn: () => financialReportsApi.getFixedCosts(startDate, endDate),
  });
}

export function useSalesRevenue(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.salesRevenue(startDate, endDate),
    queryFn: () => financialReportsApi.getSalesRevenue(startDate, endDate),
  });
}

export function useGrossProfit(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.grossProfit(startDate, endDate),
    queryFn: () => financialReportsApi.getGrossProfit(startDate, endDate),
  });
}

export function useOperatingIncome(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.operatingIncome(startDate, endDate),
    queryFn: () => financialReportsApi.getOperatingIncome(startDate, endDate),
  });
}

export function useOtherExpenses(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.otherExpenses(startDate, endDate),
    queryFn: () => financialReportsApi.getOtherExpenses(startDate, endDate),
  });
}

export function useNetProfit(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.netProfit(startDate, endDate),
    queryFn: () => financialReportsApi.getNetProfit(startDate, endDate),
  });
}

export function useFullIncomeStatement(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financialReportKeys.incomeStatement(startDate, endDate),
    queryFn: () => financialReportsApi.getFullIncomeStatement(startDate, endDate),
  });
}

export function useRecipeCostBreakdown(recipeId: string) {
  return useQuery({
    queryKey: financialReportKeys.recipeCost(recipeId),
    queryFn: () => financialReportsApi.getRecipeCost(recipeId),
    enabled: !!recipeId,
  });
}
