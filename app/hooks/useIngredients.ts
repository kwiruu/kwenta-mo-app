import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ingredientsApi,
  type Ingredient,
  type CreateIngredientDto,
} from "~/lib/api";
import { useAuthStore } from "~/stores/authStore";

// Query keys for cache management
export const ingredientKeys = {
  all: ["ingredients"] as const,
  lists: () => [...ingredientKeys.all, "list"] as const,
  list: (filters: { search?: string; category?: string }) =>
    [...ingredientKeys.lists(), filters] as const,
  details: () => [...ingredientKeys.all, "detail"] as const,
  detail: (id: string) => [...ingredientKeys.details(), id] as const,
  lowStock: () => [...ingredientKeys.all, "low-stock"] as const,
};

// Fetch all ingredients
export function useIngredients(search?: string, category?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: ingredientKeys.list({ search, category }),
    queryFn: () => ingredientsApi.getAll(search, category),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch single ingredient
export function useIngredient(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: ingredientKeys.detail(id),
    queryFn: () => ingredientsApi.getById(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Fetch low stock ingredients
export function useLowStockIngredients() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: ingredientKeys.lowStock(),
    queryFn: () => ingredientsApi.getLowStock(),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Create ingredient mutation
export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientDto) => ingredientsApi.create(data),
    onSuccess: () => {
      // Invalidate all ingredient lists to refetch
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lowStock() });
    },
  });
}

// Create bulk ingredients mutation
export function useCreateBulkIngredients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ingredients: CreateIngredientDto[]) =>
      ingredientsApi.createBulk(ingredients),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lowStock() });
    },
  });
}

// Update ingredient mutation
export function useUpdateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateIngredientDto>;
    }) => ingredientsApi.update(id, data),
    onSuccess: (updatedIngredient) => {
      // Update the specific ingredient in cache
      queryClient.setQueryData(
        ingredientKeys.detail(updatedIngredient.id),
        updatedIngredient
      );
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lowStock() });
    },
  });
}

// Delete ingredient mutation
export function useDeleteIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ingredientsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ingredientKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lowStock() });
    },
  });
}
