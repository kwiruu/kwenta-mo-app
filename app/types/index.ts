// Business Types
export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  location: string;
  employeeCount: number;
  avgMonthlySales: number;
  rawMaterialSource: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BusinessType =
  | 'carinderia'
  | 'food_stall'
  | 'restaurant'
  | 'catering'
  | 'bakery'
  | 'other';

// Ingredient Types
export interface Ingredient {
  id: string;
  businessId: string;
  name: string;
  unit: IngredientUnit;
  pricePerUnit: number;
  currentStock: number;
  reorderLevel: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IngredientUnit =
  | 'kg'
  | 'g'
  | 'pcs'
  | 'L'
  | 'mL'
  | 'oz'
  | 'lb'
  | 'pack'
  | 'bottle'
  | 'can'
  | 'bundle';

// Recipe Types
export interface Recipe {
  id: string;
  businessId: string;
  name: string;
  sellingPrice: number;
  prepTimeMinutes: number;
  laborRatePerHour: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantityRequired: number;
  ingredient?: Ingredient;
}

// Expense Types
export interface OperatingExpense {
  id: string;
  businessId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'daily' | 'yearly' | 'quarterly';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'marketing'
  | 'supplies'
  | 'maintenance'
  | 'equipment'
  | 'transportation'
  | 'permits'
  | 'other';

// Sales Types
export interface SalesRecord {
  id: string;
  businessId: string;
  recipeId: string;
  quantitySold: number;
  unitPrice: number;
  totalAmount: number;
  dateSold: Date;
}

// Costing Types
export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadAllocation: number;
  totalCost: number;
  sellingPrice: number;
  grossProfit: number;
  profitMargin: number;
}

// Report Types
export interface FinancialReport {
  id: string;
  businessId: string;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  data: Record<string, any>;
  generatedAt: Date;
}

export type ReportType = 'cogs' | 'income_statement' | 'expense_report' | 'profit_summary';

// File Upload Types
export interface FileUpload {
  id: string;
  businessId: string;
  fileName: string;
  fileType: string;
  uploadType: UploadType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsProcessed: number;
  uploadedAt: Date;
}

export type UploadType = 'ingredients' | 'sales' | 'expenses';
