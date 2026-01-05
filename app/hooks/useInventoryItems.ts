import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryItemsApi,
  type InventoryItem,
  type CreateInventoryItemDto,
  type InventoryType,
} from "~/lib/api";
import { useAuthStore } from "~/stores/authStore";

// Query keys for cache management
export const inventoryItemKeys = {
  all: ["inventoryItems"] as const,
  lists: () => [...inventoryItemKeys.all, "list"] as const,
  list: (filters: { search?: string; itemType?: InventoryType }) =>
    [...inventoryItemKeys.lists(), filters] as const,
  details: () => [...inventoryItemKeys.all, "detail"] as const,
  detail: (id: string) => [...inventoryItemKeys.details(), id] as const,
  lowStock: () => [...inventoryItemKeys.all, "low-stock"] as const,
};

// Fetch all inventory items
export function useInventoryItems(search?: string, itemType?: InventoryType) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: inventoryItemKeys.list({ search, itemType }),
    queryFn: () => inventoryItemsApi.getAll(search, itemType),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch single inventory item
export function useInventoryItem(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: inventoryItemKeys.detail(id),
    queryFn: () => inventoryItemsApi.getById(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Fetch low stock inventory items
export function useLowStockInventoryItems() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: inventoryItemKeys.lowStock(),
    queryFn: () => inventoryItemsApi.getLowStock(),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Create inventory item mutation
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryItemDto) =>
      inventoryItemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lowStock() });
    },
  });
}

// Create bulk inventory items mutation
export function useCreateBulkInventoryItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: CreateInventoryItemDto[]) =>
      inventoryItemsApi.createBulk(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lowStock() });
    },
  });
}

// Update inventory item mutation
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateInventoryItemDto>;
    }) => inventoryItemsApi.update(id, data),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(
        inventoryItemKeys.detail(updatedItem.id),
        updatedItem
      );
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.lowStock() });
    },
  });
}

// Delete inventory item mutation
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemKeys.all });
    },
  });
}
