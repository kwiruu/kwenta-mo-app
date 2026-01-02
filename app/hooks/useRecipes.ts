import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  recipesApi,
  type Recipe,
  type CreateRecipeDto,
  type RecipeCost,
} from "~/lib/api";
import { useAuthStore } from "~/stores/authStore";

// Query keys for cache management
export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (search?: string) => [...recipeKeys.lists(), { search }] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  costs: () => [...recipeKeys.all, "cost"] as const,
  cost: (id: string) => [...recipeKeys.costs(), id] as const,
};

// Fetch all recipes
export function useRecipes(search?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: recipeKeys.list(search),
    queryFn: () => recipesApi.getAll(search),
    enabled: isAuthenticated && !isAuthLoading,
  });
}

// Fetch single recipe
export function useRecipe(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipesApi.getById(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Fetch recipe cost
export function useRecipeCost(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: recipeKeys.cost(id),
    queryFn: () => recipesApi.getCost(id),
    enabled: !!id && isAuthenticated && !isAuthLoading,
  });
}

// Create recipe mutation
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecipeDto) => recipesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

// Update recipe mutation
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRecipeDto>;
    }) => recipesApi.update(id, data),
    onSuccess: (updatedRecipe) => {
      queryClient.setQueryData(
        recipeKeys.detail(updatedRecipe.id),
        updatedRecipe
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      // Also invalidate cost since ingredients may have changed
      queryClient.invalidateQueries({
        queryKey: recipeKeys.cost(updatedRecipe.id),
      });
    },
  });
}

// Delete recipe mutation
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: recipeKeys.cost(deletedId) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}
