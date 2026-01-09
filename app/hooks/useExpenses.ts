import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  expensesApi,
  type Expense,
  type CreateExpenseDto,
  type ExpenseStats,
  type ExpenseCategory,
} from '~/lib/api';
import { useAuthStore } from '~/stores/authStore';

// Query keys for cache management
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: { startDate?: string; endDate?: string; category?: ExpenseCategory }) =>
    [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
  statsWithFilters: (startDate?: string, endDate?: string) =>
    [...expenseKeys.stats(), { startDate, endDate }] as const,
};

// Fetch all expenses with optional filters
export function useExpenses(filters?: {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expensesApi.getAll(filters?.category, filters?.startDate, filters?.endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch single expense
export function useExpense(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expensesApi.getById(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Fetch expense statistics
export function useExpenseStats(startDate?: string, endDate?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: expenseKeys.statsWithFilters(startDate, endDate),
    queryFn: () => expensesApi.getStats(startDate, endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => expensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Create bulk expenses mutation
export function useCreateBulkExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto[]) => expensesApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Update expense mutation
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseDto> }) =>
      expensesApi.update(id, data),
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(expenseKeys.detail(updatedExpense.id), updatedExpense);
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Delete expense mutation
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}
