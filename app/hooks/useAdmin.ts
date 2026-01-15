import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdminStats,
  AdminUsersResponse,
  AdminUserDetails,
  AdminActivity,
  AdminLowStockItem,
  AdminRevenueChartData,
  AdminInventoryResponse,
  AdminInventoryStats,
  AdminInventoryTransactionsResponse,
  AdminRecipesResponse,
  AdminRecipeStats,
  AdminSalesResponse,
  AdminSalesStats,
  AdminExpensesResponse,
  AdminExpenseStats,
  AdminFinancialSummary,
  AdminCategoryMemoryResponse,
  AdminAuditLogResponse,
} from '~/lib/api';
import { adminApi } from '~/lib/api';

// Query keys for cache management
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: (page?: number, limit?: number, search?: string) =>
    [...adminKeys.all, 'users', { page, limit, search }] as const,
  userDetails: (userId: string) => [...adminKeys.all, 'user', userId] as const,
  activity: (limit?: number) => [...adminKeys.all, 'activity', { limit }] as const,
  lowStock: (limit?: number) => [...adminKeys.all, 'lowStock', { limit }] as const,
  revenueChart: () => [...adminKeys.all, 'revenueChart'] as const,
  // Inventory
  inventory: (page?: number, limit?: number, search?: string, type?: string) =>
    [...adminKeys.all, 'inventory', { page, limit, search, type }] as const,
  inventoryStats: () => [...adminKeys.all, 'inventoryStats'] as const,
  inventoryTransactions: (page?: number, limit?: number, type?: string) =>
    [...adminKeys.all, 'inventoryTransactions', { page, limit, type }] as const,
  // Recipes
  recipes: (page?: number, limit?: number, search?: string, category?: string) =>
    [...adminKeys.all, 'recipes', { page, limit, search, category }] as const,
  recipeStats: () => [...adminKeys.all, 'recipeStats'] as const,
  // Sales
  sales: (page?: number, limit?: number, startDate?: string, endDate?: string, category?: string) =>
    [...adminKeys.all, 'sales', { page, limit, startDate, endDate, category }] as const,
  salesStats: () => [...adminKeys.all, 'salesStats'] as const,
  // Expenses
  expenses: (
    page?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
    category?: string,
    type?: string
  ) => [...adminKeys.all, 'expenses', { page, limit, startDate, endDate, category, type }] as const,
  expenseStats: () => [...adminKeys.all, 'expenseStats'] as const,
  // Reports
  financialSummary: (startDate?: string, endDate?: string) =>
    [...adminKeys.all, 'financialSummary', { startDate, endDate }] as const,
  // Settings
  categoryMemory: (page?: number, limit?: number) =>
    [...adminKeys.all, 'categoryMemory', { page, limit }] as const,
  // Audit
  auditLog: (page?: number, limit?: number, type?: string) =>
    [...adminKeys.all, 'auditLog', { page, limit, type }] as const,
};

// ============ DASHBOARD HOOKS ============

// Shared staleTime for consistent caching (5 minutes like user queries)
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes for frequently changing data

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: adminKeys.stats(),
    queryFn: () => adminApi.getStats(),
    staleTime: STALE_TIME,
    refetchOnMount: false, // Don't refetch when navigating back
  });
}

export function useAdminUsers(page = 1, limit = 10, search?: string) {
  return useQuery<AdminUsersResponse>({
    queryKey: adminKeys.users(page, limit, search),
    queryFn: () => adminApi.getUsers(page, limit, search),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminUserDetails(userId: string) {
  return useQuery<AdminUserDetails>({
    queryKey: adminKeys.userDetails(userId),
    queryFn: () => adminApi.getUserDetails(userId),
    enabled: !!userId,
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminActivity(limit = 20) {
  return useQuery<AdminActivity[]>({
    queryKey: adminKeys.activity(limit),
    queryFn: () => adminApi.getRecentActivity(limit),
    staleTime: STALE_TIME_SHORT, // Activity changes more frequently
    refetchOnMount: false,
  });
}

export function useAdminLowStock(limit = 10) {
  return useQuery<AdminLowStockItem[]>({
    queryKey: adminKeys.lowStock(limit),
    queryFn: () => adminApi.getLowStockItems(limit),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminRevenueChart() {
  return useQuery<AdminRevenueChartData[]>({
    queryKey: adminKeys.revenueChart(),
    queryFn: () => adminApi.getRevenueChart(),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ INVENTORY HOOKS ============

export function useAdminInventory(page = 1, limit = 20, search?: string, type?: string) {
  return useQuery<AdminInventoryResponse>({
    queryKey: adminKeys.inventory(page, limit, search, type),
    queryFn: () => adminApi.getInventory(page, limit, search, type),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminInventoryStats() {
  return useQuery<AdminInventoryStats>({
    queryKey: adminKeys.inventoryStats(),
    queryFn: () => adminApi.getInventoryStats(),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminInventoryTransactions(page = 1, limit = 20, type?: string) {
  return useQuery<AdminInventoryTransactionsResponse>({
    queryKey: adminKeys.inventoryTransactions(page, limit, type),
    queryFn: () => adminApi.getInventoryTransactions(page, limit, type),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ RECIPE HOOKS ============

export function useAdminRecipes(page = 1, limit = 20, search?: string, category?: string) {
  return useQuery<AdminRecipesResponse>({
    queryKey: adminKeys.recipes(page, limit, search, category),
    queryFn: () => adminApi.getRecipes(page, limit, search, category),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminRecipeStats() {
  return useQuery<AdminRecipeStats>({
    queryKey: adminKeys.recipeStats(),
    queryFn: () => adminApi.getRecipeStats(),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ SALES HOOKS ============

export function useAdminSales(
  page = 1,
  limit = 20,
  startDate?: string,
  endDate?: string,
  category?: string
) {
  return useQuery<AdminSalesResponse>({
    queryKey: adminKeys.sales(page, limit, startDate, endDate, category),
    queryFn: () => adminApi.getSales(page, limit, startDate, endDate, category),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminSalesStats() {
  return useQuery<AdminSalesStats>({
    queryKey: adminKeys.salesStats(),
    queryFn: () => adminApi.getSalesStats(),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ EXPENSE HOOKS ============

export function useAdminExpenses(
  page = 1,
  limit = 20,
  startDate?: string,
  endDate?: string,
  category?: string,
  type?: string
) {
  return useQuery<AdminExpensesResponse>({
    queryKey: adminKeys.expenses(page, limit, startDate, endDate, category, type),
    queryFn: () => adminApi.getExpenses(page, limit, startDate, endDate, category, type),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminExpenseStats() {
  return useQuery<AdminExpenseStats>({
    queryKey: adminKeys.expenseStats(),
    queryFn: () => adminApi.getExpenseStats(),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ REPORTS HOOKS ============

export function useAdminFinancialSummary(startDate?: string, endDate?: string) {
  return useQuery<AdminFinancialSummary>({
    queryKey: adminKeys.financialSummary(startDate, endDate),
    queryFn: () => adminApi.getFinancialSummary(startDate, endDate),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

// ============ SETTINGS HOOKS ============

export function useAdminCategoryMemory(page = 1, limit = 20) {
  return useQuery<AdminCategoryMemoryResponse>({
    queryKey: adminKeys.categoryMemory(page, limit),
    queryFn: () => adminApi.getCategoryMemory(page, limit),
    staleTime: STALE_TIME,
    refetchOnMount: false,
  });
}

export function useDeleteCategoryMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategoryMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

// ============ AUDIT HOOKS ============

export function useAdminAuditLog(page = 1, limit = 50, type?: string) {
  return useQuery<AdminAuditLogResponse>({
    queryKey: adminKeys.auditLog(page, limit, type),
    queryFn: () => adminApi.getAuditLog(page, limit, type),
    staleTime: STALE_TIME_SHORT, // Audit logs change frequently
    refetchOnMount: false,
  });
}
