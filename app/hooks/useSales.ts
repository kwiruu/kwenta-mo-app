import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  salesApi,
  type Sale,
  type CreateSaleDto,
  type SalesStats,
} from "~/lib/api";
import { useAuthStore } from "~/stores/authStore";

// Query keys for cache management
export const salesKeys = {
  all: ["sales"] as const,
  lists: () => [...salesKeys.all, "list"] as const,
  list: (filters?: { startDate?: string; endDate?: string }) =>
    [...salesKeys.lists(), filters] as const,
  details: () => [...salesKeys.all, "detail"] as const,
  detail: (id: string) => [...salesKeys.details(), id] as const,
  stats: () => [...salesKeys.all, "stats"] as const,
  statsWithDate: (startDate?: string, endDate?: string) =>
    [...salesKeys.stats(), { startDate, endDate }] as const,
};

// Fetch all sales with optional filters
export function useSales(filters?: { startDate?: string; endDate?: string }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: salesKeys.list(filters),
    queryFn: () => salesApi.getAll(filters?.startDate, filters?.endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch single sale
export function useSale(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesApi.getById(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Fetch sales statistics
export function useSalesStats(startDate?: string, endDate?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: salesKeys.statsWithDate(startDate, endDate),
    queryFn: () => salesApi.getStats(startDate, endDate),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Create sale mutation
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleDto) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
    },
  });
}

// Update sale mutation
export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSaleDto> }) =>
      salesApi.update(id, data),
    onSuccess: (updatedSale) => {
      queryClient.setQueryData(salesKeys.detail(updatedSale.id), updatedSale);
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
    },
  });
}

// Delete sale mutation
export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
    },
  });
}
