import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryTransactionsApi, restockApi } from '../lib/api';
import type { TransactionFilters, RestockDto } from '../lib/api';

/**
 * Hook to fetch inventory transactions with optional filters
 */
export function useInventoryTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['inventory-transactions', filters],
    queryFn: () => inventoryTransactionsApi.getAll(filters),
  });
}

/**
 * Hook to fetch transactions for a specific item
 */
export function useItemTransactions(purchaseId?: string) {
  return useQuery({
    queryKey: ['inventory-transactions', 'item', purchaseId],
    queryFn: () => inventoryTransactionsApi.getByItem(purchaseId!),
    enabled: !!purchaseId,
  });
}

/**
 * Hook to fetch transaction stats
 */
export function useTransactionStats() {
  return useQuery({
    queryKey: ['inventory-transactions', 'stats'],
    queryFn: () => inventoryTransactionsApi.getStats(),
  });
}

/**
 * Hook to restock an item (add quantity)
 */
export function useRestock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RestockDto }) => restockApi.restock(id, data),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
    },
  });
}
