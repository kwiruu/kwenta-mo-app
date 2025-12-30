import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SalesRecord } from "~/types";

interface SalesRecordWithDetails extends SalesRecord {
  recipeName?: string;
  costBreakdown?: {
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    grossProfit: number;
  };
}

interface SalesStore {
  sales: SalesRecordWithDetails[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations - will connect to backend API
  fetchSales: (filters?: {
    startDate?: Date;
    endDate?: Date;
    recipeId?: string;
  }) => Promise<void>;
  addSale: (
    sale: Omit<SalesRecord, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateSale: (id: string, sale: Partial<SalesRecord>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSaleById: (id: string) => SalesRecordWithDetails | undefined;

  // Analytics - will be computed by backend
  getTotalSales: (startDate?: Date, endDate?: Date) => number;
  getTotalProfit: (startDate?: Date, endDate?: Date) => number;
  getSalesByRecipe: () => {
    recipeId: string;
    recipeName: string;
    totalSales: number;
    totalProfit: number;
  }[];
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],
      isLoading: false,
      error: null,

      fetchSales: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          // const params = new URLSearchParams();
          // if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
          // if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
          // if (filters?.recipeId) params.append('recipeId', filters.recipeId);
          // const response = await fetch(`/api/sales?${params}`);
          // const data = await response.json();
          // set({ sales: data, isLoading: false });
          set({ isLoading: false });
        } catch (error) {
          set({ error: "Failed to fetch sales", isLoading: false });
        }
      },

      addSale: async (sale) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          const newSale: SalesRecordWithDetails = {
            ...sale,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            sales: [...state.sales, newSale],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to add sale", isLoading: false });
        }
      },

      updateSale: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          set((state) => ({
            sales: state.sales.map((s) =>
              s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update sale", isLoading: false });
        }
      },

      deleteSale: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with API call
          set((state) => ({
            sales: state.sales.filter((s) => s.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete sale", isLoading: false });
        }
      },

      getSaleById: (id) => {
        return get().sales.find((s) => s.id === id);
      },

      getTotalSales: (startDate, endDate) => {
        // TODO: Will be computed by backend API
        return get()
          .sales.filter((s) => {
            if (startDate && new Date(s.dateSold) < startDate) return false;
            if (endDate && new Date(s.dateSold) > endDate) return false;
            return true;
          })
          .reduce((sum, s) => sum + s.totalAmount, 0);
      },

      getTotalProfit: (startDate, endDate) => {
        // TODO: Will be computed by backend API
        return get()
          .sales.filter((s) => {
            if (startDate && new Date(s.dateSold) < startDate) return false;
            if (endDate && new Date(s.dateSold) > endDate) return false;
            return true;
          })
          .reduce((sum, s) => sum + (s.costBreakdown?.grossProfit || 0), 0);
      },

      getSalesByRecipe: () => {
        // TODO: Will be computed by backend API
        const salesByRecipe: Record<
          string,
          {
            recipeId: string;
            recipeName: string;
            totalSales: number;
            totalProfit: number;
          }
        > = {};
        get().sales.forEach((s) => {
          if (!salesByRecipe[s.recipeId]) {
            salesByRecipe[s.recipeId] = {
              recipeId: s.recipeId,
              recipeName: s.recipeName || "Unknown",
              totalSales: 0,
              totalProfit: 0,
            };
          }
          salesByRecipe[s.recipeId].totalSales += s.totalAmount;
          salesByRecipe[s.recipeId].totalProfit +=
            s.costBreakdown?.grossProfit || 0;
        });
        return Object.values(salesByRecipe);
      },
    }),
    {
      name: "kwentamo-sales",
    }
  )
);
