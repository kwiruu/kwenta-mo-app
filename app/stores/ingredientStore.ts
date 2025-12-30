import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Ingredient } from "~/types";

type IngredientInput = Omit<
  Ingredient,
  "id" | "businessId" | "createdAt" | "updatedAt"
>;

interface IngredientState {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: IngredientInput) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIngredientStore = create<IngredientState>()(
  devtools(
    persist(
      (set) => ({
        ingredients: [],
        isLoading: false,
        error: null,

        setIngredients: (ingredients) => set({ ingredients }),

        addIngredient: (ingredientData) => {
          const newIngredient: Ingredient = {
            ...ingredientData,
            id: crypto.randomUUID(),
            businessId: "default", // Will be replaced with actual business ID
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            ingredients: [...state.ingredients, newIngredient],
          }));
        },

        updateIngredient: (id, updates) =>
          set((state) => ({
            ingredients: state.ingredients.map((i) =>
              i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i
            ),
          })),

        deleteIngredient: (id) =>
          set((state) => ({
            ingredients: state.ingredients.filter((i) => i.id !== id),
          })),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),
      }),
      {
        name: "kwentamo-ingredients",
        partialize: (state) => ({
          ingredients: state.ingredients,
        }),
      }
    ),
    { name: "IngredientStore" }
  )
);
