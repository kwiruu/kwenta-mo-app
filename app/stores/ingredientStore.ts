import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Ingredient } from "~/types";

interface IngredientState {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIngredientStore = create<IngredientState>()(
  devtools((set) => ({
    ingredients: [],
    isLoading: false,
    error: null,

    setIngredients: (ingredients) => set({ ingredients }),

    addIngredient: (ingredient) =>
      set((state) => ({
        ingredients: [...state.ingredients, ingredient],
      })),

    updateIngredient: (id, updates) =>
      set((state) => ({
        ingredients: state.ingredients.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      })),

    deleteIngredient: (id) =>
      set((state) => ({
        ingredients: state.ingredients.filter((i) => i.id !== id),
      })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),
  }))
);
