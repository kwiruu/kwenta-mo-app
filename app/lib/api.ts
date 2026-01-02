import { getAccessToken } from "./supabase";

// API URLs
const LOCAL_API = "http://localhost:3000/api";
const PRODUCTION_API = "https://kwenta-mo-api.onrender.com/api";

// Function to get API URL at runtime
function getApiUrl(): string {
  // Check environment variable first
  const envUseProduction = import.meta.env.VITE_USE_PRODUCTION_API;
  
  if (envUseProduction === "true") {
    return import.meta.env.VITE_API_URL_PRODUCTION || PRODUCTION_API;
  }
  
  if (envUseProduction === "false") {
    return import.meta.env.VITE_API_URL_LOCAL || LOCAL_API;
  }
  
  // Auto-detect based on hostname (runtime check)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return import.meta.env.VITE_API_URL_LOCAL || LOCAL_API;
    }
  }
  
  // Default to production
  return import.meta.env.VITE_API_URL_PRODUCTION || PRODUCTION_API;
}

const API_URL = getApiUrl();

console.log("API URL:", API_URL);

const REQUEST_TIMEOUT = 15000; // 15 seconds timeout

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      timeout = REQUEST_TIMEOUT,
      ...fetchOptions
    } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = await getAccessToken();
      if (token) {
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/csv")) {
        return response.text() as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "An error occurred",
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timed out", 408, null);
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Create API client instance
export const api = new ApiClient(API_URL);

// ============ AUTH API ============
export const authApi = {
  syncUser: (name?: string) => api.post("/auth/sync", { name }),
  getMe: () => api.get("/auth/me"),
};

// ============ USERS API ============
export interface Business {
  id: string;
  userId: string;
  businessName: string;
  businessType?: string;
  address?: string;
  phone?: string;
  taxId?: string;
  currency: string;
  employeeCount?: number;
  avgMonthlySales?: number;
  rawMaterialSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  business?: Business;
}

export interface UpdateBusinessDto {
  businessName: string;
  businessType?: string;
  address?: string;
  phone?: string;
  taxId?: string;
  currency?: string;
  employeeCount?: number;
  avgMonthlySales?: number;
  rawMaterialSource?: string;
}

export const usersApi = {
  getProfile: (): Promise<UserProfile> => api.get("/users/profile"),
  updateBusiness: (data: UpdateBusinessDto): Promise<Business> =>
    api.put("/users/business", data),
};

// ============ INGREDIENTS API ============
export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  unit: string;
  costPerUnit: number;
  currentStock: number;
  reorderLevel: number;
  supplier?: string;
  notes?: string;
}

export interface CreateIngredientDto {
  name: string;
  category?: string;
  unit: string;
  costPerUnit: number;
  currentStock?: number;
  reorderLevel?: number;
  supplier?: string;
  notes?: string;
}

export const ingredientsApi = {
  getAll: (search?: string, category?: string): Promise<Ingredient[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    const query = params.toString();
    return api.get(`/ingredients${query ? `?${query}` : ""}`);
  },
  getById: (id: string): Promise<Ingredient> => api.get(`/ingredients/${id}`),
  create: (data: CreateIngredientDto): Promise<Ingredient> =>
    api.post("/ingredients", data),
  createBulk: (ingredients: CreateIngredientDto[]): Promise<Ingredient[]> =>
    api.post("/ingredients/bulk", { ingredients }),
  update: (
    id: string,
    data: Partial<CreateIngredientDto>
  ): Promise<Ingredient> => api.put(`/ingredients/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/ingredients/${id}`),
  getLowStock: (): Promise<Ingredient[]> => api.get("/ingredients/low-stock"),
};

// ============ RECIPES API ============
export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  ingredient: Ingredient;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  preparationTime?: number;
  sellingPrice: number;
  imageUrl?: string;
  ingredients: RecipeIngredient[];
}

export interface CreateRecipeDto {
  name: string;
  description?: string;
  servings?: number;
  preparationTime?: number;
  sellingPrice: number;
  imageUrl?: string;
  ingredients?: { ingredientId: string; quantity: number }[];
}

export interface RecipeCost {
  recipe: Recipe;
  ingredientsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
}

export const recipesApi = {
  getAll: (search?: string): Promise<Recipe[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const query = params.toString();
    return api.get(`/recipes${query ? `?${query}` : ""}`);
  },
  getById: (id: string): Promise<Recipe> => api.get(`/recipes/${id}`),
  getCost: (id: string): Promise<RecipeCost> => api.get(`/recipes/${id}/cost`),
  create: (data: CreateRecipeDto): Promise<Recipe> =>
    api.post("/recipes", data),
  update: (id: string, data: Partial<CreateRecipeDto>): Promise<Recipe> =>
    api.put(`/recipes/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/recipes/${id}`),
};

// ============ SALES API ============
export interface Sale {
  id: string;
  recipeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costOfGoods: number;
  profit: number;
  saleDate: string;
  notes?: string;
  recipe: Recipe;
}

export interface CreateSaleDto {
  recipeId: string;
  quantity: number;
  unitPrice?: number;
  saleDate?: string;
  notes?: string;
}

export interface SalesStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  salesCount: number;
}

export const salesApi = {
  getAll: (startDate?: string, endDate?: string): Promise<Sale[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/sales${query ? `?${query}` : ""}`);
  },
  getById: (id: string): Promise<Sale> => api.get(`/sales/${id}`),
  getStats: (startDate?: string, endDate?: string): Promise<SalesStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/sales/stats${query ? `?${query}` : ""}`);
  },
  create: (data: CreateSaleDto): Promise<Sale> => api.post("/sales", data),
  update: (id: string, data: Partial<CreateSaleDto>): Promise<Sale> =>
    api.put(`/sales/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/sales/${id}`),
};

// ============ EXPENSES API ============
export type ExpenseCategory =
  | "INGREDIENTS"
  | "LABOR"
  | "UTILITIES"
  | "RENT"
  | "EQUIPMENT"
  | "MARKETING"
  | "TRANSPORTATION"
  | "PACKAGING"
  | "OTHER";

export type ExpenseFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  frequency: ExpenseFrequency;
  expenseDate: string;
  notes?: string;
}

export interface CreateExpenseDto {
  category: ExpenseCategory;
  description: string;
  amount: number;
  frequency?: ExpenseFrequency;
  expenseDate?: string;
  notes?: string;
}

export interface ExpenseStats {
  total: number;
  byCategory: { category: ExpenseCategory; amount: number }[];
}

export const expensesApi = {
  getAll: (
    category?: ExpenseCategory,
    startDate?: string,
    endDate?: string
  ): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/expenses${query ? `?${query}` : ""}`);
  },
  getById: (id: string): Promise<Expense> => api.get(`/expenses/${id}`),
  getStats: (startDate?: string, endDate?: string): Promise<ExpenseStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/expenses/stats${query ? `?${query}` : ""}`);
  },
  create: (data: CreateExpenseDto): Promise<Expense> =>
    api.post("/expenses", data),
  createBulk: (expenses: CreateExpenseDto[]): Promise<Expense[]> =>
    api.post("/expenses/bulk", { expenses }),
  update: (id: string, data: Partial<CreateExpenseDto>): Promise<Expense> =>
    api.put(`/expenses/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/expenses/${id}`),
};

// ============ REPORTS API ============
export interface COGSReport {
  period: { startDate?: string; endDate?: string };
  summary: {
    totalRevenue: number;
    totalCOGS: number;
    grossProfit: number;
    grossProfitMargin: number;
  };
  byRecipe: {
    recipeId: string;
    recipeName: string;
    quantity: number;
    revenue: number;
    cogs: number;
    profit: number;
  }[];
}

export interface IncomeStatement {
  period: { startDate?: string; endDate?: string };
  revenue: { sales: number; totalRevenue: number };
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: {
    total: number;
    breakdown: { category: string; amount: number }[];
  };
  netProfit: number;
  netProfitMargin: number;
}

export interface ProfitSummary {
  period: { startDate?: string; endDate?: string };
  recipes: {
    recipeId: string;
    recipeName: string;
    sellingPrice: number;
    quantitySold: number;
    revenue: number;
    costOfGoods: number;
    profit: number;
    profitMargin: number;
    salesCount: number;
  }[];
  totals: { revenue: number; cogs: number; profit: number };
}

export interface DashboardSummary {
  currentMonth: {
    revenue: number;
    expenses: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
  };
  changes: { revenue: number; expenses: number };
  alerts: { lowStockCount: number };
}

export interface ChartDataPoint {
  name: string;
  revenue: number;
  expenses: number;
}

export interface ChartDataResponse {
  period: "daily" | "weekly" | "monthly";
  data: ChartDataPoint[];
}

export const reportsApi = {
  getCOGS: (startDate?: string, endDate?: string): Promise<COGSReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/reports/cogs${query ? `?${query}` : ""}`);
  },
  getIncomeStatement: (
    startDate?: string,
    endDate?: string
  ): Promise<IncomeStatement> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/reports/income-statement${query ? `?${query}` : ""}`);
  },
  getProfitSummary: (
    startDate?: string,
    endDate?: string
  ): Promise<ProfitSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/reports/profit-summary${query ? `?${query}` : ""}`);
  },
  getDashboard: (): Promise<DashboardSummary> => api.get("/reports/dashboard"),
  getChartData: (
    period: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<ChartDataResponse> =>
    api.get(`/reports/chart-data?period=${period}`),
  exportCSV: (
    type: "sales" | "expenses" | "ingredients",
    startDate?: string,
    endDate?: string
  ): Promise<string> => {
    const params = new URLSearchParams();
    params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/reports/export/csv?${params.toString()}`);
  },
  exportExcel: async (
    type: "sales" | "expenses",
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const token = await getAccessToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/reports/export/excel?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export Excel file");
    }

    return response.blob();
  },
};
