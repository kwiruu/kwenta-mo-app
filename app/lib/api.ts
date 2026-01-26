import { getAccessToken, refreshSession, clearTokenCache } from './supabase';
import { useAuthStore } from '~/stores/authStore';

// API URLs
const LOCAL_API = 'http://localhost:3000/api';
const PRODUCTION_API = 'https://kwenta-mo-api.onrender.com/api';

// Get API URL from environment variable or default to local
// Use VITE_USE_PRODUCTION_API=true in production
const API_URL =
  import.meta.env.VITE_USE_PRODUCTION_API === 'true'
    ? import.meta.env.VITE_API_URL_PRODUCTION || PRODUCTION_API
    : import.meta.env.VITE_API_URL_LOCAL || LOCAL_API;

const REQUEST_TIMEOUT = 15000; // 15 seconds timeout

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
  _isRetry?: boolean; // Internal flag to prevent infinite retry loops
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      skipAuth = false,
      timeout = REQUEST_TIMEOUT,
      _isRetry = false,
      ...fetchOptions
    } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = await getAccessToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add impersonation header if active
    const { impersonatedUserId, isImpersonating } = useAuthStore.getState();
    if (isImpersonating && impersonatedUserId) {
      (headers as Record<string, string>)['X-Impersonate-User'] = impersonatedUserId;
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
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return response.text() as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - attempt to refresh token and retry once
        if (response.status === 401 && !skipAuth && !_isRetry) {
          console.log('Received 401, attempting to refresh session and retry...');

          const { session, error } = await refreshSession();

          if (session && !error) {
            console.log('Session refreshed, retrying request...');
            // Retry the request with the new token
            return this.request<T>(endpoint, { ...options, _isRetry: true });
          } else {
            console.warn('Session refresh failed, redirecting to login...');
            // Clear token cache and redirect to login
            clearTokenCache();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              window.location.href = '/login?expired=true';
            }
          }
        }

        throw new ApiError(data.message || 'An error occurred', response.status, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408, null);
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create API client instance
export const api = new ApiClient(API_URL);

// ============ AUTH API ============
export interface SyncUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = {
  syncUser: (name?: string) => api.post<SyncUserResponse>('/auth/sync', { name }),
  getMe: () => api.get('/auth/me'),
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
  overheadRate: number;
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
  overheadRate?: number;
}

export const usersApi = {
  getProfile: (): Promise<UserProfile> => api.get('/users/profile'),
  updateBusiness: (data: UpdateBusinessDto): Promise<Business> => api.put('/users/business', data),
};

// ============ INGREDIENTS API (LEGACY - use purchasesApi) ============
// For backwards compatibility, we alias Ingredient to Purchase
export type Ingredient = Purchase;
export type CreateIngredientDto = CreatePurchaseDto;

// Legacy ingredients API - redirects to purchases
export const ingredientsApi = {
  getAll: (_search?: string, _category?: string): Promise<Ingredient[]> => {
    return purchasesApi.getAll();
  },
  getById: (id: string): Promise<Ingredient> => purchasesApi.getById(id),
  create: (data: CreateIngredientDto): Promise<Ingredient> =>
    purchasesApi.create({
      ...data,
      itemType: data.itemType || 'RAW_MATERIAL',
    }),
  createBulk: (ingredients: CreateIngredientDto[]): Promise<Ingredient[]> =>
    purchasesApi.createBulk(ingredients),
  update: (id: string, data: Partial<CreateIngredientDto>): Promise<Ingredient> =>
    purchasesApi.update(id, data),
  delete: (id: string): Promise<void> => purchasesApi.delete(id),
  getLowStock: (): Promise<Ingredient[]> => purchasesApi.getLowStockAlerts(),
};

// ============ RECIPES API ============
export interface RecipeItem {
  id: string;
  purchaseId: string;
  quantity: number;
  unit: string;
  purchase: Purchase;
}

// Legacy alias for backwards compatibility
export type RecipeIngredient = RecipeItem;

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  preparationTime?: number;
  sellingPrice: number;
  imageUrl?: string;
  items: RecipeItem[];
  // Legacy alias
  ingredients?: RecipeItem[];
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
    if (search) params.append('search', search);
    const query = params.toString();
    return api.get(`/recipes${query ? `?${query}` : ''}`);
  },
  getById: (id: string): Promise<Recipe> => api.get(`/recipes/${id}`),
  getCost: (id: string): Promise<RecipeCost> => api.get(`/recipes/${id}/cost`),
  create: (data: CreateRecipeDto): Promise<Recipe> => api.post('/recipes', data),
  update: (id: string, data: Partial<CreateRecipeDto>): Promise<Recipe> =>
    api.put(`/recipes/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/recipes/${id}`),
};

// ============ SALES API ============
export type SaleCategory = 'FOOD' | 'BEVERAGE' | 'CATERING' | 'DELIVERY';

export interface Sale {
  id: string;
  recipeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costOfGoods: number;
  profit: number;
  saleDate: string;
  category: SaleCategory;
  notes?: string;
  recipe: Recipe;
}

export interface CreateSaleDto {
  recipeId: string;
  quantity: number;
  unitPrice?: number;
  saleDate?: string;
  category?: SaleCategory;
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
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/sales${query ? `?${query}` : ''}`);
  },
  getById: (id: string): Promise<Sale> => api.get(`/sales/${id}`),
  getStats: (startDate?: string, endDate?: string): Promise<SalesStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/sales/stats${query ? `?${query}` : ''}`);
  },
  create: (data: CreateSaleDto): Promise<Sale> => api.post('/sales', data),
  update: (id: string, data: Partial<CreateSaleDto>): Promise<Sale> =>
    api.put(`/sales/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/sales/${id}`),
};

// ============ EXPENSES API ============
export type ExpenseCategory =
  // Variable Costs (COGS-related)
  | 'INGREDIENTS'
  | 'PACKAGING'
  | 'DELIVERY_FEES'
  | 'TRANSACTION_FEES'
  // Operating Expenses (OPEX)
  | 'RENT'
  | 'UTILITIES'
  | 'ELECTRICITY'
  | 'WATER'
  | 'GAS'
  | 'SALARIES'
  | 'MARKETING'
  | 'SUPPLIES'
  | 'MAINTENANCE'
  | 'INSURANCE_LICENSES'
  // Fixed Costs
  | 'FIXED_SALARIES'
  | 'DEPRECIATION'
  | 'PERMITS_LICENSES'
  | 'INTERNET'
  // Other Expenses
  | 'TAX_EXPENSE'
  | 'INTEREST_EXPENSE'
  | 'BANK_CHARGES'
  // Legacy/General
  | 'LABOR'
  | 'EQUIPMENT'
  | 'TRANSPORTATION'
  | 'OTHER';

export type ExpenseType = 'FIXED' | 'VARIABLE' | 'OPERATING' | 'OTHER';

export type ExpenseFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  type: ExpenseType;
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
    if (category) params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/expenses${query ? `?${query}` : ''}`);
  },
  getById: (id: string): Promise<Expense> => api.get(`/expenses/${id}`),
  getStats: (startDate?: string, endDate?: string): Promise<ExpenseStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/expenses/stats${query ? `?${query}` : ''}`);
  },
  create: (data: CreateExpenseDto): Promise<Expense> => api.post('/expenses', data),
  createBulk: (expenses: CreateExpenseDto[]): Promise<Expense[]> =>
    api.post('/expenses/bulk', { expenses }),
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
  period: 'daily' | 'weekly' | 'monthly';
  data: ChartDataPoint[];
}

export const reportsApi = {
  getCOGS: (startDate?: string, endDate?: string): Promise<COGSReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/cogs${query ? `?${query}` : ''}`);
  },
  getIncomeStatement: (startDate?: string, endDate?: string): Promise<IncomeStatement> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/income-statement${query ? `?${query}` : ''}`);
  },
  getProfitSummary: (startDate?: string, endDate?: string): Promise<ProfitSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/profit-summary${query ? `?${query}` : ''}`);
  },
  getDashboard: (): Promise<DashboardSummary> => api.get('/reports/dashboard'),
  getChartData: (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ChartDataResponse> =>
    api.get(`/reports/chart-data?period=${period}`),
  exportCSV: (
    type: 'sales' | 'expenses' | 'ingredients',
    startDate?: string,
    endDate?: string
  ): Promise<string> => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/reports/export/csv?${params.toString()}`);
  },
  exportExcel: async (
    type: 'sales' | 'expenses',
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/reports/export/excel?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export Excel file');
    }

    return response.blob();
  },
};

// ============ INVENTORY TYPES ============
export type InventoryType =
  | 'RAW_MATERIAL'
  | 'PACKAGING'
  | 'INGREDIENT'
  | 'SPICE'
  | 'CONDIMENT'
  | 'BEVERAGE'
  | 'DAIRY'
  | 'PRODUCE'
  | 'PROTEIN'
  | 'GRAIN'
  | 'OIL'
  | 'SUPPLY'
  | 'EQUIPMENT'
  | 'OTHER';

// ============ PURCHASES API (THE INVENTORY) ============
// Purchase IS the inventory item now - they are merged

export interface Purchase {
  id: string;
  periodId?: string;
  // Item fields (merged from InventoryItem)
  name: string;
  itemType: InventoryType;
  unit: string;
  // Stock tracking
  quantity: number; // This IS the current stock (can be 0)
  reorderLevel: number;
  // Cost info
  unitCost: number;
  totalCost: number;
  // Purchase details
  supplier?: string;
  purchaseDate: string;
  notes?: string;
  period?: InventoryPeriod;
  createdAt: string;
  updatedAt: string;
}

// Alias InventoryItem to Purchase for backwards compatibility
export type InventoryItem = Purchase;

export interface CreatePurchaseDto {
  periodId?: string;
  itemName: string;
  itemType?: InventoryType;
  unit?: string;
  reorderLevel?: number;
  quantity: number;
  unitCost: number;
  supplier?: string;
  purchaseDate?: string;
  notes?: string;
}

// Alias for backwards compatibility
export type CreateInventoryItemDto = CreatePurchaseDto;

export interface PurchaseStats {
  total: { amount: number; count: number };
  byType: { type: InventoryType; amount: number; count: number }[];
}

export const purchasesApi = {
  getAll: (
    itemType?: InventoryType,
    periodId?: string,
    startDate?: string,
    endDate?: string,
    supplier?: string
  ): Promise<Purchase[]> => {
    const params = new URLSearchParams();
    if (itemType) params.append('itemType', itemType);
    if (periodId) params.append('periodId', periodId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (supplier) params.append('supplier', supplier);
    const query = params.toString();
    return api.get(`/purchases${query ? `?${query}` : ''}`);
  },
  getById: (id: string): Promise<Purchase> => api.get(`/purchases/${id}`),
  getStats: (startDate?: string, endDate?: string): Promise<PurchaseStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/purchases/stats${query ? `?${query}` : ''}`);
  },
  getLowStockAlerts: (): Promise<Purchase[]> => api.get('/purchases/alerts/low-stock'),
  getInventoryItems: (): Promise<Purchase[]> => api.get('/purchases/inventory-items'),
  create: (data: CreatePurchaseDto): Promise<Purchase> => api.post('/purchases', data),
  createBulk: (purchases: CreatePurchaseDto[]): Promise<Purchase[]> =>
    api.post('/purchases/bulk', purchases),
  update: (id: string, data: Partial<CreatePurchaseDto>): Promise<Purchase> =>
    api.put(`/purchases/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/purchases/${id}`),
};

// Legacy inventoryItemsApi - now redirects to purchases
export const inventoryItemsApi = {
  getAll: (_search?: string, itemType?: InventoryType): Promise<InventoryItem[]> => {
    return purchasesApi.getAll(itemType);
  },
  getById: (id: string): Promise<InventoryItem> => purchasesApi.getById(id),
  create: (data: CreateInventoryItemDto): Promise<InventoryItem> => purchasesApi.create(data),
  createBulk: (items: CreateInventoryItemDto[]): Promise<InventoryItem[]> =>
    purchasesApi.createBulk(items),
  update: (id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> =>
    purchasesApi.update(id, data),
  delete: (id: string): Promise<void> => purchasesApi.delete(id),
  getLowStock: (): Promise<InventoryItem[]> => purchasesApi.getLowStockAlerts(),
};

// ============ INVENTORY API ============
export interface InventoryPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isActive: boolean;
  snapshots?: InventorySnapshot[];
  purchases?: Purchase[];
  createdAt: string;
  updatedAt: string;
}

export interface InventorySnapshot {
  id: string;
  periodId: string;
  purchaseId?: string;
  itemName: string;
  itemType: InventoryType;
  snapshotType: 'BEGINNING' | 'ENDING';
  quantity: number;
  unitCost: number;
  totalValue: number;
  purchase?: Purchase;
  createdAt: string;
}

export interface CreateInventoryPeriodDto {
  periodName: string;
  startDate: string;
  endDate: string;
}

export interface CreateInventorySnapshotDto {
  periodId: string;
  purchaseId?: string;
  itemName: string;
  itemType: InventoryType;
  snapshotType: 'BEGINNING' | 'ENDING';
  quantity: number;
  unitCost: number;
}

export interface InventorySummary {
  beginning: {
    total: number;
    rawMaterials: number;
    packaging: number;
    itemCount: number;
  };
  ending: {
    total: number;
    rawMaterials: number;
    packaging: number;
    itemCount: number;
  };
  inventoryChange: number;
}

export const inventoryApi = {
  // Periods
  getAllPeriods: (): Promise<InventoryPeriod[]> => api.get('/inventory/periods'),
  getActivePeriod: (): Promise<InventoryPeriod> => api.get('/inventory/periods/active'),
  getLatestPeriod: (): Promise<InventoryPeriod | null> => api.get('/inventory/periods/latest'),
  setActivePeriod: (id: string): Promise<InventoryPeriod> =>
    api.put(`/inventory/periods/${id}/activate`, {}),
  getPeriodById: (id: string): Promise<InventoryPeriod> => api.get(`/inventory/periods/${id}`),
  getPeriodSummary: (id: string): Promise<InventorySummary> =>
    api.get(`/inventory/periods/${id}/summary`),
  createPeriod: (data: CreateInventoryPeriodDto): Promise<InventoryPeriod> =>
    api.post('/inventory/periods', data),
  updatePeriod: (id: string, data: Partial<CreateInventoryPeriodDto>): Promise<InventoryPeriod> =>
    api.put(`/inventory/periods/${id}`, data),
  deletePeriod: (id: string): Promise<void> => api.delete(`/inventory/periods/${id}`),

  // Snapshots
  getSnapshots: (periodId: string): Promise<InventorySnapshot[]> =>
    api.get(`/inventory/periods/${periodId}/snapshots`),
  getSnapshotById: (id: string): Promise<InventorySnapshot> =>
    api.get(`/inventory/snapshots/${id}`),
  createSnapshot: (data: CreateInventorySnapshotDto): Promise<InventorySnapshot> =>
    api.post('/inventory/snapshots', data),
  createBulkSnapshots: (snapshots: CreateInventorySnapshotDto[]): Promise<InventorySnapshot[]> =>
    api.post('/inventory/snapshots/bulk', snapshots),
  updateSnapshot: (
    id: string,
    data: Partial<CreateInventorySnapshotDto>
  ): Promise<InventorySnapshot> => api.put(`/inventory/snapshots/${id}`, data),
  deleteSnapshot: (id: string): Promise<void> => api.delete(`/inventory/snapshots/${id}`),

  // Helpers
  copyFromPurchases: (
    periodId: string,
    snapshotType: 'BEGINNING' | 'ENDING'
  ): Promise<InventorySnapshot[]> =>
    api.post(`/inventory/periods/${periodId}/copy-from-purchases?snapshotType=${snapshotType}`),
};

// ============ INVENTORY TRANSACTIONS API ============
export type TransactionType = 'INITIAL' | 'RESTOCK' | 'SALE';

export interface InventoryTransaction {
  id: string;
  purchaseId: string;
  type: TransactionType;
  quantityChange: number; // positive for INITIAL/RESTOCK, negative for SALE
  quantityBefore: number;
  quantityAfter: number;
  unitCost?: number;
  referenceId?: string; // saleId if from sale
  notes?: string;
  createdAt: string;
  purchase?: {
    id: string;
    name: string;
    unit: string;
    itemType: InventoryType;
  };
}

export interface TransactionFilters {
  purchaseId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  todayTransactions: number;
  restockCount: number;
  saleCount: number;
}

export const inventoryTransactionsApi = {
  getAll: (filters?: TransactionFilters): Promise<InventoryTransaction[]> => {
    const params = new URLSearchParams();
    if (filters?.purchaseId) params.append('purchaseId', filters.purchaseId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString();
    return api.get(`/inventory-transactions${query ? `?${query}` : ''}`);
  },
  getByItem: (purchaseId: string): Promise<InventoryTransaction[]> =>
    api.get(`/inventory-transactions/item/${purchaseId}`),
  getStats: (): Promise<TransactionStats> => api.get('/inventory-transactions/stats'),
};

// Restock API - add stock to existing item
export interface RestockDto {
  quantity: number;
  notes?: string;
  unitCost?: number;
}

export const restockApi = {
  restock: (id: string, data: RestockDto): Promise<Purchase> =>
    api.post(`/purchases/${id}/restock`, data),
};

// ============ FINANCIAL REPORTS API ============
export interface FinancialCOGS {
  period: { startDate: string; endDate: string };
  beginningInventory: {
    total: number;
    rawMaterials: number;
    packaging: number;
  };
  purchases: { total: number; rawMaterials: number; packaging: number };
  endingInventory: { total: number; rawMaterials: number; packaging: number };
  cogs: number;
  formula: string;
}

export interface OperatingExpenses {
  period: { startDate?: string; endDate?: string };
  total: number;
  breakdown: {
    utilities: number;
    rent: number;
    marketing: number;
    transportation: number;
    supplies: number;
    maintenance: number;
    insurance: number;
    internet: number;
    other: number;
  };
  byCategory: { category: string; amount: number }[];
}

export interface VariableCosts {
  period: { startDate?: string; endDate?: string };
  total: number;
  breakdown: {
    ingredients: number;
    packaging: number;
    deliveryFees: number;
    transactionFees: number;
    labor: number;
    other: number;
  };
}

export interface FixedCosts {
  period: { startDate?: string; endDate?: string };
  total: number;
  breakdown: {
    rent: number;
    salaries: number;
    depreciation: number;
    permits: number;
    insurance: number;
    internet: number;
    other: number;
  };
}

export interface SalesRevenue {
  period: { startDate?: string; endDate?: string };
  total: number;
  byCategory: {
    food: number;
    beverage: number;
    catering: number;
    delivery: number;
  };
  salesCount: number;
}

export interface GrossProfit {
  period: { startDate?: string; endDate?: string };
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossProfitMargin: number;
}

export interface OperatingIncome {
  period: { startDate?: string; endDate?: string };
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number;
}

export interface OtherExpenses {
  period: { startDate?: string; endDate?: string };
  total: number;
  breakdown: {
    taxExpense: number;
    interestExpense: number;
    depreciation: number;
    bankCharges: number;
  };
}

export interface NetProfit {
  period: { startDate?: string; endDate?: string };
  operatingIncome: number;
  otherExpenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface FullIncomeStatement {
  period: { startDate?: string; endDate?: string };
  revenue: {
    foodSales: number;
    beverageSales: number;
    cateringSales: number;
    deliverySales: number;
    totalRevenue: number;
  };
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: {
    rent: number;
    utilities: number;
    salaries: number;
    marketing: number;
    supplies: number;
    maintenance: number;
    insuranceLicenses: number;
    miscellaneous: number;
    total: number;
  };
  operatingIncome: number;
  otherExpenses: {
    taxExpense: number;
    interestExpense: number;
    depreciation: number;
    bankCharges: number;
    total: number;
  };
  netProfit: number;
  netProfitMargin: number;
  costAnalysis: {
    variableCosts: VariableCosts;
    fixedCosts: FixedCosts;
    totalCosts: number;
  };
}

export interface RecipeCostBreakdown {
  recipe: Recipe;
  ingredients: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
  totalIngredientCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
}

export const financialReportsApi = {
  getCOGS: (startDate: string, endDate: string): Promise<FinancialCOGS> => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return api.get(`/reports/financial/cogs?${params.toString()}`);
  },
  getOperatingExpenses: (startDate?: string, endDate?: string): Promise<OperatingExpenses> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/opex${query ? `?${query}` : ''}`);
  },
  getVariableCosts: (startDate?: string, endDate?: string): Promise<VariableCosts> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/variable-costs${query ? `?${query}` : ''}`);
  },
  getFixedCosts: (startDate?: string, endDate?: string): Promise<FixedCosts> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/fixed-costs${query ? `?${query}` : ''}`);
  },
  getSalesRevenue: (startDate?: string, endDate?: string): Promise<SalesRevenue> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/sales-revenue${query ? `?${query}` : ''}`);
  },
  getGrossProfit: (startDate?: string, endDate?: string): Promise<GrossProfit> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/gross-profit${query ? `?${query}` : ''}`);
  },
  getOperatingIncome: (startDate?: string, endDate?: string): Promise<OperatingIncome> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/operating-income${query ? `?${query}` : ''}`);
  },
  getOtherExpenses: (startDate?: string, endDate?: string): Promise<OtherExpenses> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/other-expenses${query ? `?${query}` : ''}`);
  },
  getNetProfit: (startDate?: string, endDate?: string): Promise<NetProfit> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/net-profit${query ? `?${query}` : ''}`);
  },
  getFullIncomeStatement: (startDate?: string, endDate?: string): Promise<FullIncomeStatement> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/financial/income-statement${query ? `?${query}` : ''}`);
  },
  getRecipeCost: (recipeId: string): Promise<RecipeCostBreakdown> =>
    api.get(`/reports/financial/recipe-cost/${recipeId}`),
};

// ============ RECEIPT SCANNER TYPES ============
export type ItemCategory = 'INVENTORY' | 'EXPENSE' | 'UNKNOWN';

export type DocumentType = 'RECEIPT' | 'UTILITY_BILL' | 'RENT_BILL' | 'GENERAL_BILL';

export type ScannerExpenseType =
  | 'UTILITIES'
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'GAS'
  | 'RENT'
  | 'MAINTENANCE'
  | 'SUPPLIES'
  | 'EQUIPMENT'
  | 'SALARY'
  | 'OTHER';

export interface ScannedItem {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  category: ItemCategory;
  expenseType?: ScannerExpenseType;
  inventoryType?: string;
  confidence: number;
  rawText: string;
  matchedWith?: string;
}

export interface VendorInfo {
  name?: string;
  address?: string;
  phone?: string;
  tin?: string;
}

export interface BillInfo {
  providerName?: string;
  accountNumber?: string;
  accountName?: string;
  billingPeriod?: string;
  dueDate?: string;
  billDate?: string;
  previousReading?: string;
  currentReading?: string;
  consumption?: string;
  meterNumber?: string;
}

export interface TotalValidation {
  calculatedTotal: number;
  detectedTotal?: number;
  difference: number;
  isValid: boolean;
  message: string;
}

export interface ScanResult {
  documentType?: DocumentType;
  items: ScannedItem[];
  rawText: string;
  scannedAt: string;
  inventoryCount: number;
  expenseCount: number;
  unknownCount: number;
  vendor?: VendorInfo;
  billInfo?: BillInfo;
  totalValidation?: TotalValidation;
}

export interface SaveInventoryItem {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  inventoryType: string;
  purchaseDate?: string;
  notes?: string;
  periodId?: string;
  supplier?: string;
}

export interface SaveExpenseItem {
  name: string;
  amount: number;
  category: string;
  frequency: string;
  notes?: string;
  date?: string;
}

export interface SaveScannedItemsDto {
  inventoryItems: SaveInventoryItem[];
  expenseItems: SaveExpenseItem[];
  vendor?: VendorInfo;
  purchaseDate?: string;
}

export interface SaveResult {
  inventorySaved: number;
  expensesSaved: number;
}

// Category correction for learning
export interface CategoryCorrection {
  itemName: string;
  category: ItemCategory;
  subCategory?: string;
  vendor?: string;
}

export interface LearningStats {
  totalPatterns: number;
  inventoryPatterns: number;
  expensePatterns: number;
  topPatterns: Array<{ pattern: string; category: string; useCount: number }>;
}

// ============ RECEIPT SCANNER API ============
export const receiptScannerApi = {
  scanReceipt: async (file: File, _isRetry = false): Promise<ScanResult> => {
    const token = await getAccessToken();
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_URL}/receipt/scan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 - attempt to refresh and retry once
      if (response.status === 401 && !_isRetry) {
        console.log('Receipt scan received 401, attempting to refresh session...');

        const { session, error } = await refreshSession();

        if (session && !error) {
          console.log('Session refreshed, retrying receipt scan...');
          return receiptScannerApi.scanReceipt(file, true);
        } else {
          console.warn('Session refresh failed, redirecting to login...');
          clearTokenCache();
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
      }

      const error = await response.json();
      throw new ApiError(error.message || 'Failed to scan receipt', response.status, error);
    }

    return response.json();
  },

  saveItems: (data: SaveScannedItemsDto): Promise<SaveResult> => api.post('/receipt/save', data),

  // Save category corrections for learning
  learnFromCorrections: (corrections: CategoryCorrection[]): Promise<{ savedCount: number }> =>
    api.post('/receipt/learn', { corrections }),

  // Get learning statistics
  getLearningStats: (): Promise<LearningStats> => api.get('/receipt/learning-stats'),

  parseText: (
    text: string
  ): Promise<{
    items: ScannedItem[];
    inventoryCount: number;
    expenseCount: number;
    unknownCount: number;
  }> => api.post('/receipt/parse-text', { text }),
};

// ============ ADMIN TYPES ============
export interface AdminStats {
  overview: {
    totalUsers: number;
    totalRecipes: number;
    totalInventoryItems: number;
    totalSales: number;
    totalExpenses: number;
    lowStockAlerts: number;
    newUsersThisMonth: number;
  };
  financial: {
    monthlyRevenue: number;
    lastMonthRevenue: number;
    revenueChange: number;
    monthlyExpenses: number;
    lastMonthExpenses: number;
    expenseChange: number;
    netProfit: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  business: Business | null;
  _count: {
    recipes: number;
    sales: number;
    expenses: number;
    purchases: number;
  };
}

export interface AdminUserDetails extends AdminUser {
  recipes: Array<{ id: string; name: string; sellingPrice: number; createdAt: string }>;
  sales: Array<{
    id: string;
    quantity: number;
    totalPrice: number;
    saleDate: string;
    recipe: { name: string };
  }>;
  expenses: Array<{
    id: string;
    category: string;
    amount: number;
    expenseDate: string;
    description: string;
  }>;
  purchases: Array<{
    id: string;
    name: string;
    quantity: number;
    totalCost: number;
    purchaseDate: string;
  }>;
  stats: {
    totalRevenue: number;
    totalProfit: number;
    salesCount: number;
    totalExpenses: number;
    expensesCount: number;
    totalPurchases: number;
    purchasesCount: number;
  };
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminActivity {
  type: 'sale' | 'expense' | 'purchase';
  id: string;
  description: string;
  amount: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface AdminLowStockItem {
  id: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  userId: string;
  userEmail: string;
  userName: string | null;
}

export interface AdminRevenueChartData {
  date: string;
  revenue: number;
}

// Inventory types
export interface AdminInventoryItem {
  id: string;
  name: string;
  itemType: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  reorderLevel: number;
  supplier: string | null;
  purchaseDate: string;
  user: { email: string; name: string | null };
}

export interface AdminInventoryResponse {
  items: AdminInventoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminInventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  byType: Array<{ type: string; count: number; value: number }>;
}

export interface AdminInventoryTransaction {
  id: string;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  unitCost: number | null;
  notes: string | null;
  createdAt: string;
  purchase: {
    name: string;
    unit: string;
    user: { email: string; name: string | null };
  };
}

export interface AdminInventoryTransactionsResponse {
  transactions: AdminInventoryTransaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Recipe types
export interface AdminRecipe {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  sellingPrice: number;
  laborCost: number;
  overheadCost: number;
  isActive: boolean;
  createdAt: string;
  user: { email: string; name: string | null };
  _count: { sales: number };
  calculatedCost: {
    ingredientCost: number;
    totalCost: number;
    profit: number;
    margin: number;
  };
}

export interface AdminRecipesResponse {
  recipes: AdminRecipe[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminRecipeStats {
  totalRecipes: number;
  activeRecipes: number;
  inactiveRecipes: number;
  categories: Array<{ category: string; count: number }>;
  topSelling: Array<{ recipeId: string; name: string; quantitySold: number; revenue: number }>;
}

// Sales types
export interface AdminSale {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costOfGoods: number;
  profit: number;
  saleDate: string;
  category: string;
  user: { email: string; name: string | null };
  recipe: { name: string };
}

export interface AdminSalesResponse {
  sales: AdminSale[];
  summary: { totalRevenue: number; totalProfit: number; totalCOGS: number; count: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminSalesStats {
  allTime: { revenue: number; profit: number; count: number };
  thisMonth: { revenue: number; profit: number; count: number };
  thisWeek: { revenue: number; profit: number; count: number };
  byCategory: Array<{ category: string; revenue: number; count: number }>;
  dailyAverage: number;
}

// Expense types
export interface AdminExpense {
  id: string;
  category: string;
  type: string;
  description: string;
  amount: number;
  frequency: string;
  expenseDate: string;
  user: { email: string; name: string | null };
}

export interface AdminExpensesResponse {
  expenses: AdminExpense[];
  summary: { totalAmount: number; count: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminExpenseStats {
  allTime: { amount: number; count: number };
  thisMonth: { amount: number; count: number };
  byCategory: Array<{ category: string; amount: number; count: number }>;
  byType: Array<{ type: string; amount: number; count: number }>;
  byFrequency: Array<{ frequency: string; amount: number; count: number }>;
}

// Financial summary
export interface AdminFinancialSummary {
  period: { startDate?: string; endDate?: string };
  revenue: { total: number; salesCount: number };
  costs: { cogs: number; operatingExpenses: number; purchasesCost: number };
  profit: { gross: number; grossMargin: number; net: number; netMargin: number };
}

// Category memory
export interface AdminCategoryMemoryItem {
  id: string;
  userId: string;
  itemPattern: string;
  category: string;
  subCategory: string | null;
  vendor: string | null;
  useCount: number;
  createdAt: string;
}

export interface AdminCategoryMemoryResponse {
  patterns: AdminCategoryMemoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Audit log
export interface AdminAuditLogItem {
  type: 'sale' | 'expense' | 'purchase' | 'recipe' | 'user';
  id: string;
  action: string;
  description: string;
  user: string;
  createdAt: string;
}

export interface AdminAuditLogResponse {
  logs: AdminAuditLogItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ============ ADMIN API ============
export const adminApi = {
  // Get dashboard statistics
  getStats: (): Promise<AdminStats> => api.get('/admin/stats'),

  // Get all users with pagination
  getUsers: (page = 1, limit = 10, search?: string): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    return api.get(`/admin/users?${params.toString()}`);
  },

  // Get single user details
  getUserDetails: (userId: string): Promise<AdminUserDetails> => api.get(`/admin/users/${userId}`),

  // Get recent activity
  getRecentActivity: (limit = 20): Promise<AdminActivity[]> =>
    api.get(`/admin/activity?limit=${limit}`),

  // Get low stock items
  getLowStockItems: (limit = 10): Promise<AdminLowStockItem[]> =>
    api.get(`/admin/low-stock?limit=${limit}`),

  // Get revenue chart data
  getRevenueChart: (): Promise<AdminRevenueChartData[]> => api.get('/admin/revenue-chart'),

  // ============ INVENTORY ============
  getInventory: (
    page = 1,
    limit = 20,
    search?: string,
    type?: string
  ): Promise<AdminInventoryResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    return api.get(`/admin/inventory?${params.toString()}`);
  },

  getInventoryStats: (): Promise<AdminInventoryStats> => api.get('/admin/inventory/stats'),

  getInventoryTransactions: (
    page = 1,
    limit = 20,
    type?: string
  ): Promise<AdminInventoryTransactionsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    return api.get(`/admin/inventory/transactions?${params.toString()}`);
  },

  // ============ RECIPES ============
  getRecipes: (
    page = 1,
    limit = 20,
    search?: string,
    category?: string
  ): Promise<AdminRecipesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    return api.get(`/admin/recipes?${params.toString()}`);
  },

  getRecipeStats: (): Promise<AdminRecipeStats> => api.get('/admin/recipes/stats'),

  // ============ SALES ============
  getSales: (
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
    category?: string
  ): Promise<AdminSalesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    return api.get(`/admin/sales?${params.toString()}`);
  },

  getSalesStats: (): Promise<AdminSalesStats> => api.get('/admin/sales/stats'),

  // ============ EXPENSES ============
  getExpenses: (
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
    category?: string,
    type?: string
  ): Promise<AdminExpensesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    return api.get(`/admin/expenses?${params.toString()}`);
  },

  getExpenseStats: (): Promise<AdminExpenseStats> => api.get('/admin/expenses/stats'),

  // ============ REPORTS ============
  getFinancialSummary: (startDate?: string, endDate?: string): Promise<AdminFinancialSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/financial?${params.toString()}`);
  },

  // ============ SETTINGS ============
  getCategoryMemory: (page = 1, limit = 20): Promise<AdminCategoryMemoryResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return api.get(`/admin/settings/category-memory?${params.toString()}`);
  },

  deleteCategoryMemory: (id: string): Promise<void> =>
    api.delete(`/admin/settings/category-memory/${id}`),

  // ============ AUDIT ============
  getAuditLog: (page = 1, limit = 50, type?: string): Promise<AdminAuditLogResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    return api.get(`/admin/audit?${params.toString()}`);
  },
};
