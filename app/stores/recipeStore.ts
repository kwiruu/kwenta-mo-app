import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe, RecipeIngredient, CostBreakdown } from "~/types";

interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
  costBreakdown?: CostBreakdown;
}

interface RecipeStore {
  recipes: RecipeWithIngredients[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations - will connect to backend API
  fetchRecipes: () => Promise<void>;
  addRecipe: (
    recipe: Omit<RecipeWithIngredients, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateRecipe: (
    id: string,
    recipe: Partial<RecipeWithIngredients>
  ) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => RecipeWithIngredients | undefined;

  // Costing calculations - will be handled by backend
  calculateCost: (recipeId: string) => CostBreakdown | null;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      isLoading: false,
      error: null,

      fetchRecipes: async () => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          // const response = await fetch('/api/recipes');
          // const data = await response.json();
          // set({ recipes: data, isLoading: false });
          set({ isLoading: false });
        } catch (error) {
          set({ error: "Failed to fetch recipes", isLoading: false });
        }
      },

      addRecipe: async (recipe) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          const newRecipe: RecipeWithIngredients = {
            ...recipe,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            recipes: [...state.recipes, newRecipe],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to add recipe", isLoading: false });
        }
      },

      updateRecipe: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          set((state) => ({
            recipes: state.recipes.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update recipe", isLoading: false });
        }
      },

      deleteRecipe: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          set((state) => ({
            recipes: state.recipes.filter((r) => r.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete recipe", isLoading: false });
        }
      },

      getRecipeById: (id) => {
        return get().recipes.find((r) => r.id === id);
      },

      calculateCost: (recipeId) => {
        // TODO: This will be calculated by the backend
        const recipe = get().recipes.find((r) => r.id === recipeId);
        if (!recipe) return null;

        // Placeholder calculation - will be replaced by API
        const materialCost = recipe.ingredients.reduce((sum, ing) => {
          const unitCost = ing.ingredient?.pricePerUnit || 0;
          return sum + unitCost * ing.quantityRequired;
        }, 0);

        const laborCost =
          (recipe.prepTimeMinutes / 60) * recipe.laborRatePerHour;
        const overheadAllocation = materialCost * 0.15; // 15% overhead placeholder
        const totalCost = materialCost + laborCost + overheadAllocation;
        const grossProfit = recipe.sellingPrice - totalCost;
        const profitMargin = (grossProfit / recipe.sellingPrice) * 100;

        return {
          materialCost,
          laborCost,
          overheadAllocation,
          totalCost,
          sellingPrice: recipe.sellingPrice,
          grossProfit,
          profitMargin,
        };
      },
    }),
    {
      name: "kwentamo-recipes",
    }
  )
);
