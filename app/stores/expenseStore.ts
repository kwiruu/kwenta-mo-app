import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { OperatingExpense, ExpenseCategory } from "~/types";

type ExpenseInput = Omit<
  OperatingExpense,
  "id" | "businessId" | "createdAt" | "updatedAt"
>;

interface ExpenseState {
  expenses: OperatingExpense[];
  isLoading: boolean;
  error: string | null;
}

interface ExpenseActions {
  addExpense: (expense: ExpenseInput) => void;
  updateExpense: (id: string, updates: Partial<OperatingExpense>) => void;
  deleteExpense: (id: string) => void;
  setExpenses: (expenses: OperatingExpense[]) => void;
  getExpensesByCategory: (category: ExpenseCategory) => OperatingExpense[];
  getTotalMonthlyExpenses: () => number;
  clearExpenses: () => void;
}

type ExpenseStore = ExpenseState & ExpenseActions;

export const useExpenseStore = create<ExpenseStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        expenses: [],
        isLoading: false,
        error: null,

        // Actions
        addExpense: (expenseData) => {
          const newExpense: OperatingExpense = {
            ...expenseData,
            id: crypto.randomUUID(),
            businessId: "default", // Will be replaced with actual business ID
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(
            (state) => ({
              expenses: [...state.expenses, newExpense],
            }),
            false,
            "addExpense"
          );
        },

        updateExpense: (id, updates) => {
          set(
            (state) => ({
              expenses: state.expenses.map((expense) =>
                expense.id === id
                  ? { ...expense, ...updates, updatedAt: new Date() }
                  : expense
              ),
            }),
            false,
            "updateExpense"
          );
        },

        deleteExpense: (id) => {
          set(
            (state) => ({
              expenses: state.expenses.filter((expense) => expense.id !== id),
            }),
            false,
            "deleteExpense"
          );
        },

        setExpenses: (expenses) => {
          set({ expenses }, false, "setExpenses");
        },

        getExpensesByCategory: (category) => {
          return get().expenses.filter((e) => e.category === category);
        },

        getTotalMonthlyExpenses: () => {
          const { expenses } = get();
          return expenses.reduce((total, expense) => {
            // Convert to monthly based on frequency
            switch (expense.frequency) {
              case "daily":
                return total + expense.amount * 30;
              case "weekly":
                return total + expense.amount * 4;
              case "monthly":
                return total + expense.amount;
              case "quarterly":
                return total + expense.amount / 3;
              case "yearly":
                return total + expense.amount / 12;
              default:
                return total + expense.amount;
            }
          }, 0);
        },

        clearExpenses: () => {
          set({ expenses: [] }, false, "clearExpenses");
        },
      }),
      {
        name: "kwentamo-expenses",
        partialize: (state) => ({
          expenses: state.expenses,
        }),
      }
    ),
    { name: "ExpenseStore" }
  )
);
