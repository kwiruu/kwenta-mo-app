import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Business } from "~/types";

interface BusinessState {
  currentBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentBusiness: (business: Business | null) => void;
  setBusinesses: (businesses: Business[]) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  devtools(
    persist(
      (set) => ({
        currentBusiness: null,
        businesses: [],
        isLoading: false,
        error: null,

        setCurrentBusiness: (business) => set({ currentBusiness: business }),

        setBusinesses: (businesses) => set({ businesses }),

        addBusiness: (business) =>
          set((state) => ({
            businesses: [...state.businesses, business],
          })),

        updateBusiness: (id, updates) =>
          set((state) => ({
            businesses: state.businesses.map((b) =>
              b.id === id ? { ...b, ...updates } : b
            ),
            currentBusiness:
              state.currentBusiness?.id === id
                ? { ...state.currentBusiness, ...updates }
                : state.currentBusiness,
          })),

        deleteBusiness: (id) =>
          set((state) => ({
            businesses: state.businesses.filter((b) => b.id !== id),
            currentBusiness:
              state.currentBusiness?.id === id ? null : state.currentBusiness,
          })),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),
      }),
      {
        name: "kwentamo-business-storage",
      }
    )
  )
);
