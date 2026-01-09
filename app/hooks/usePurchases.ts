import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchasesApi, type CreatePurchaseDto, type Purchase, type InventoryType } from '~/lib/api';

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filters: {
    itemType?: InventoryType;
    periodId?: string;
    startDate?: string;
    endDate?: string;
    supplier?: string;
  }) => [...purchaseKeys.lists(), filters] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
  stats: (startDate?: string, endDate?: string) =>
    [...purchaseKeys.all, 'stats', { startDate, endDate }] as const,
  lowStockAlerts: () => [...purchaseKeys.all, 'low-stock-alerts'] as const,
};

export function usePurchases(filters?: {
  itemType?: InventoryType;
  periodId?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
}) {
  return useQuery({
    queryKey: purchaseKeys.list(filters || {}),
    queryFn: () =>
      purchasesApi.getAll(
        filters?.itemType,
        filters?.periodId,
        filters?.startDate,
        filters?.endDate,
        filters?.supplier
      ),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => purchasesApi.getById(id),
    enabled: !!id,
  });
}

export function usePurchaseStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: purchaseKeys.stats(startDate, endDate),
    queryFn: () => purchasesApi.getStats(startDate, endDate),
  });
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: purchaseKeys.lowStockAlerts(),
    queryFn: () => purchasesApi.getLowStockAlerts(),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseDto) => purchasesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}

export function useCreateBulkPurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchases: CreatePurchaseDto[]) => purchasesApi.createBulk(purchases),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePurchaseDto> }) =>
      purchasesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}

// Get purchases as inventory items (for recipe selection)
export function useInventoryItems() {
  return useQuery({
    queryKey: [...purchaseKeys.all, 'inventory-items'] as const,
    queryFn: () => purchasesApi.getInventoryItems(),
  });
}
