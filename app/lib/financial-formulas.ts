/**
 * Financial Formulas for Food Business Calculations
 * These formulas follow standard accounting practices for food service businesses
 */

// ============================================================================
// 1. COST OF GOODS SOLD (COGS)
// ============================================================================

export interface InventoryData {
  beginningRawMaterials: number;
  beginningPackaging: number;
  ingredientPurchases: number;
  packagingPurchases: number;
  endingRawMaterials: number;
  endingPackaging: number;
}

/**
 * Calculate Cost of Goods Sold (COGS)
 * COGS = Beginning Inventory + Purchases - Ending Inventory
 */
export function calculateCOGS(inventory: InventoryData): number {
  const beginningInventory = inventory.beginningRawMaterials + inventory.beginningPackaging;
  const purchases = inventory.ingredientPurchases + inventory.packagingPurchases;
  const endingInventory = inventory.endingRawMaterials + inventory.endingPackaging;

  return beginningInventory + purchases - endingInventory;
}

// ============================================================================
// 2. OPERATING EXPENSES (OPEX)
// ============================================================================

export interface OperatingExpensesData {
  rent: number;
  utilities: number;
  salaries: number;
  marketing: number;
  supplies: number;
  maintenance: number;
  insuranceAndLicenses: number;
  miscellaneous: number;
}

/**
 * Calculate Total Operating Expenses
 * OPEX = Rent + Utilities + Salaries + Marketing + Supplies + Maintenance + Insurance & Licenses + Miscellaneous
 */
export function calculateOperatingExpenses(expenses: OperatingExpensesData): number {
  return (
    expenses.rent +
    expenses.utilities +
    expenses.salaries +
    expenses.marketing +
    expenses.supplies +
    expenses.maintenance +
    expenses.insuranceAndLicenses +
    expenses.miscellaneous
  );
}

// ============================================================================
// 3. VARIABLE COST
// ============================================================================

export interface VariableCostData {
  ingredients: number;
  packaging: number;
  deliveryFees: number;
  transactionFees: number;
}

/**
 * Calculate Total Variable Cost (Method 1)
 * Total Variable Cost = Variable Cost per Unit × Number of Units Sold
 */
export function calculateVariableCostByUnit(
  variableCostPerUnit: number,
  unitsSold: number
): number {
  return variableCostPerUnit * unitsSold;
}

/**
 * Calculate Total Variable Cost (Method 2)
 * Total Variable Cost = Ingredients + Packaging + Delivery Fees + Transaction Fees
 */
export function calculateVariableCost(costs: VariableCostData): number {
  return costs.ingredients + costs.packaging + costs.deliveryFees + costs.transactionFees;
}

// ============================================================================
// 4. FIXED COST
// ============================================================================

export interface FixedCostData {
  rent: number;
  fixedSalaries: number;
  permitsAndLicenses: number;
  internet: number;
  insurance: number;
  depreciation: number;
}

/**
 * Calculate Total Fixed Cost
 * Total Fixed Cost = Rent + Fixed Salaries + Permits & Licenses + Internet + Insurance + Depreciation
 */
export function calculateFixedCost(costs: FixedCostData): number {
  return (
    costs.rent +
    costs.fixedSalaries +
    costs.permitsAndLicenses +
    costs.internet +
    costs.insurance +
    costs.depreciation
  );
}

// ============================================================================
// 5. SALES REVENUE
// ============================================================================

export interface SalesRevenueData {
  foodSales: number;
  beverageSales: number;
  cateringSales: number;
  deliverySales: number;
}

/**
 * Calculate Total Sales Revenue
 * Sales Revenue = Food Sales + Beverage Sales + Catering Sales + Delivery Sales
 */
export function calculateSalesRevenue(sales: SalesRevenueData): number {
  return sales.foodSales + sales.beverageSales + sales.cateringSales + sales.deliverySales;
}

// ============================================================================
// 6. GROSS PROFIT
// ============================================================================

/**
 * Calculate Gross Profit
 * Gross Profit = Sales Revenue - COGS
 */
export function calculateGrossProfit(salesRevenue: number, cogs: number): number {
  return salesRevenue - cogs;
}

/**
 * Calculate Gross Profit Margin (as percentage)
 * Gross Profit Margin = (Gross Profit / Sales Revenue) × 100
 */
export function calculateGrossProfitMargin(salesRevenue: number, cogs: number): number {
  if (salesRevenue === 0) return 0;
  const grossProfit = calculateGrossProfit(salesRevenue, cogs);
  return (grossProfit / salesRevenue) * 100;
}

// ============================================================================
// 7. OPERATING INCOME
// ============================================================================

/**
 * Calculate Operating Income
 * Operating Income = Gross Profit - Operating Expenses
 */
export function calculateOperatingIncome(grossProfit: number, operatingExpenses: number): number {
  return grossProfit - operatingExpenses;
}

/**
 * Calculate Operating Profit Margin (as percentage)
 * Operating Profit Margin = (Operating Income / Sales Revenue) × 100
 */
export function calculateOperatingMargin(operatingIncome: number, salesRevenue: number): number {
  if (salesRevenue === 0) return 0;
  return (operatingIncome / salesRevenue) * 100;
}

// ============================================================================
// 8. OTHER EXPENSES
// ============================================================================

export interface OtherExpensesData {
  taxExpense: number;
  interestExpense: number;
  depreciationExpense: number;
  bankCharges: number;
}

/**
 * Calculate Total Other Expenses
 * Other Expenses = Tax Expense + Interest Expense + Depreciation Expense + Bank Charges
 */
export function calculateOtherExpenses(expenses: OtherExpensesData): number {
  return (
    expenses.taxExpense +
    expenses.interestExpense +
    expenses.depreciationExpense +
    expenses.bankCharges
  );
}

// ============================================================================
// 9. NET PROFIT
// ============================================================================

/**
 * Calculate Net Profit (Method 1)
 * Net Profit = Operating Income - Other Expenses
 */
export function calculateNetProfit(operatingIncome: number, otherExpenses: number): number {
  return operatingIncome - otherExpenses;
}

/**
 * Calculate Net Profit (Method 2 - Complete Formula)
 * Net Profit = Sales Revenue - COGS - Operating Expenses - Other Expenses
 */
export function calculateNetProfitComplete(
  salesRevenue: number,
  cogs: number,
  operatingExpenses: number,
  otherExpenses: number
): number {
  return salesRevenue - cogs - operatingExpenses - otherExpenses;
}

/**
 * Calculate Net Profit Margin (as percentage)
 * Net Profit Margin = (Net Profit / Sales Revenue) × 100
 */
export function calculateNetProfitMargin(netProfit: number, salesRevenue: number): number {
  if (salesRevenue === 0) return 0;
  return (netProfit / salesRevenue) * 100;
}

// ============================================================================
// 10. INCOME STATEMENT (COMPLETE STRUCTURE)
// ============================================================================

export interface IncomeStatementData {
  salesRevenue: number;
  cogs: number;
  operatingExpenses: number;
  otherExpenses: number;
}

export interface IncomeStatementResult {
  salesRevenue: number;
  cogs: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number;
  otherExpenses: number;
  netProfit: number;
  netProfitMargin: number;
}

/**
 * Generate Complete Income Statement
 * Calculates all key financial metrics
 */
export function generateIncomeStatement(data: IncomeStatementData): IncomeStatementResult {
  const grossProfit = calculateGrossProfit(data.salesRevenue, data.cogs);
  const grossProfitMargin = calculateGrossProfitMargin(data.salesRevenue, data.cogs);
  const operatingIncome = calculateOperatingIncome(grossProfit, data.operatingExpenses);
  const operatingMargin = calculateOperatingMargin(operatingIncome, data.salesRevenue);
  const netProfit = calculateNetProfit(operatingIncome, data.otherExpenses);
  const netProfitMargin = calculateNetProfitMargin(netProfit, data.salesRevenue);

  return {
    salesRevenue: data.salesRevenue,
    cogs: data.cogs,
    grossProfit,
    grossProfitMargin,
    operatingExpenses: data.operatingExpenses,
    operatingIncome,
    operatingMargin,
    otherExpenses: data.otherExpenses,
    netProfit,
    netProfitMargin,
  };
}

// ============================================================================
// 11. RECIPE COSTING
// ============================================================================

export interface RecipeIngredient {
  name: string;
  quantityUsed: number; // in grams, ml, pieces, etc.
  costPerUnit: number; // cost per gram, ml, piece, etc.
}

/**
 * Calculate cost for a single ingredient in a recipe
 * Ingredient Cost = Quantity Used × Cost per Unit
 */
export function calculateIngredientCost(ingredient: RecipeIngredient): number {
  return ingredient.quantityUsed * ingredient.costPerUnit;
}

/**
 * Calculate Total Recipe Cost
 * Total Recipe Cost = Σ (Ingredient Quantity Used × Cost per Unit)
 */
export function calculateTotalRecipeCost(ingredients: RecipeIngredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(ingredient);
  }, 0);
}

/**
 * Calculate Cost per Unit (when recipe yields multiple servings)
 * Cost per Unit = Total Recipe Cost / Number of Servings
 */
export function calculateCostPerServing(totalRecipeCost: number, servings: number): number {
  if (servings === 0) return 0;
  return totalRecipeCost / servings;
}

/**
 * Calculate Selling Price based on desired markup percentage
 * Selling Price = Cost per Unit × (1 + Markup Percentage)
 */
export function calculateSellingPrice(costPerUnit: number, markupPercentage: number): number {
  return costPerUnit * (1 + markupPercentage / 100);
}

/**
 * Calculate Recipe Profitability
 * Returns profit per unit and profit margin percentage
 */
export function calculateRecipeProfitability(
  costPerUnit: number,
  sellingPrice: number
): { profitPerUnit: number; profitMargin: number } {
  const profitPerUnit = sellingPrice - costPerUnit;
  const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;

  return {
    profitPerUnit,
    profitMargin,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format number as currency (Philippine Peso)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate Break-Even Point in Units
 * Break-Even Units = Fixed Costs / (Selling Price per Unit - Variable Cost per Unit)
 */
export function calculateBreakEvenUnits(
  fixedCosts: number,
  sellingPricePerUnit: number,
  variableCostPerUnit: number
): number {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  if (contributionMargin === 0) return 0;
  return fixedCosts / contributionMargin;
}

/**
 * Calculate Break-Even Point in Revenue
 * Break-Even Revenue = Break-Even Units × Selling Price per Unit
 */
export function calculateBreakEvenRevenue(
  fixedCosts: number,
  sellingPricePerUnit: number,
  variableCostPerUnit: number
): number {
  const breakEvenUnits = calculateBreakEvenUnits(
    fixedCosts,
    sellingPricePerUnit,
    variableCostPerUnit
  );
  return breakEvenUnits * sellingPricePerUnit;
}
