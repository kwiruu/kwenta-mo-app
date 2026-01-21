import { useState } from 'react';
import { Link } from 'react-router';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Warehouse,
  Receipt,
  Minus,
  Plus,
  Download,
  Info,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import {
  useFinancialCOGS,
  useOperatingExpenses,
  useVariableCosts,
  useFixedCosts,
  useSalesRevenue,
  useGrossProfit,
  useOperatingIncome,
  useOtherExpenses,
  useNetProfit,
  useFullIncomeStatement,
  useRecipes,
  useRecipeCostBreakdown,
  useCOGSReport,
  useProfitSummary,
  useExpenses,
  useExpenseStats,
} from '~/hooks';
import { reportsApi } from '~/lib/api';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Financial Reports - ${APP_CONFIG.name}` },
    { name: 'description', content: 'View your financial reports and metrics' },
  ];
}

type ReportType = 'cogs' | 'expense' | 'income' | 'profit';

const EXPENSE_COLORS: Record<string, string> = {
  INGREDIENTS: '#22c55e',
  PACKAGING: '#f97316',
  DELIVERY_FEES: '#06b6d4',
  TRANSACTION_FEES: '#14b8a6',
  RENT: '#a855f7',
  UTILITIES: '#f59e0b',
  ELECTRICITY: '#eab308',
  WATER: '#3b82f6',
  SALARIES: '#ef4444',
  MARKETING: '#ec4899',
  SUPPLIES: '#8b5cf6',
  MAINTENANCE: '#6366f1',
  INSURANCE: '#64748b',
  LICENSES: '#94a3b8',
  MISCELLANEOUS: '#71717a',
  GAS: '#ef4444',
  INTERNET: '#0ea5e9',
  TRANSPORTATION: '#f43f5e',
  REPAIRS: '#84cc16',
  EQUIPMENT: '#10b981',
  SOFTWARE: '#3b82f6',
  SUBSCRIPTIONS: '#6366f1',
  TAXES: '#ef4444',
  INTEREST: '#f97316',
  DEPRECIATION: '#71717a',
  BAD_DEBT: '#ef4444',
  DONATIONS: '#ec4899',
  TRAINING: '#06b6d4',
  LEGAL: '#64748b',
  ACCOUNTING: '#94a3b8',
  CONSULTING: '#8b5cf6',
};

const CATEGORY_LABELS: Record<string, string> = {
  INGREDIENTS: 'Ingredients',
  PACKAGING: 'Packaging',
  DELIVERY_FEES: 'Delivery Fees',
  TRANSACTION_FEES: 'Transaction Fees',
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  ELECTRICITY: 'Electricity',
  WATER: 'Water',
  SALARIES: 'Salaries',
  MARKETING: 'Marketing',
  SUPPLIES: 'Supplies',
  MAINTENANCE: 'Maintenance',
  INSURANCE: 'Insurance',
  LICENSES: 'Licenses',
  MISCELLANEOUS: 'Miscellaneous',
  GAS: 'Gas',
  INTERNET: 'Internet',
  TRANSPORTATION: 'Transportation',
  REPAIRS: 'Repairs',
  EQUIPMENT: 'Equipment',
  SOFTWARE: 'Software',
  SUBSCRIPTIONS: 'Subscriptions',
  TAXES: 'Taxes',
  INTEREST: 'Interest',
  DEPRECIATION: 'Depreciation',
  BAD_DEBT: 'Bad Debt',
  DONATIONS: 'Donations',
  TRAINING: 'Training',
  LEGAL: 'Legal',
  ACCOUNTING: 'Accounting',
  CONSULTING: 'Consulting',
};

function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export default function ReportsIndex() {
  // Date range state
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Active tab state
  const [activeReport, setActiveReport] = useState<ReportType>('cogs');

  // Selected recipe for recipe costing
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');

  // Collapsible states
  const [expandedSections, setExpandedSections] = useState<string[]>(['income-statement']);

  // Fetch all financial data for advanced section
  const { data: cogs, isLoading: loadingCOGS } = useFinancialCOGS(startDate, endDate);
  const { data: opex, isLoading: loadingOpex } = useOperatingExpenses(startDate, endDate);
  const { data: variableCosts, isLoading: loadingVariable } = useVariableCosts(startDate, endDate);
  const { data: fixedCosts, isLoading: loadingFixed } = useFixedCosts(startDate, endDate);
  const { data: salesRevenue, isLoading: loadingSales } = useSalesRevenue(startDate, endDate);
  const { data: grossProfit, isLoading: loadingGross } = useGrossProfit(startDate, endDate);
  const { data: operatingIncome, isLoading: loadingOperating } = useOperatingIncome(
    startDate,
    endDate
  );
  const { data: otherExpenses, isLoading: loadingOther } = useOtherExpenses(startDate, endDate);
  const { data: netProfit, isLoading: loadingNet } = useNetProfit(startDate, endDate);
  const { data: incomeStatement, isLoading: loadingStatement } = useFullIncomeStatement(
    startDate,
    endDate
  );
  const { data: recipes = [] } = useRecipes();
  const { data: recipeCost, isLoading: loadingRecipe } = useRecipeCostBreakdown(selectedRecipeId);

  // Fetch data for basic reports tabs
  const { data: cogsReport, isLoading: cogsReportLoading } = useCOGSReport(startDate, endDate);
  const { data: profitSummary, isLoading: profitLoading } = useProfitSummary(startDate, endDate);
  const { data: expenses = [] } = useExpenses({
    startDate: startDate,
    endDate: endDate,
  });
  const { data: stats } = useExpenseStats(startDate, endDate);

  const isLoading =
    loadingCOGS ||
    loadingOpex ||
    loadingVariable ||
    loadingFixed ||
    loadingSales ||
    loadingGross ||
    loadingOperating ||
    loadingOther ||
    loadingNet ||
    loadingStatement ||
    cogsReportLoading ||
    profitLoading;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Quick date range selection
  const setQuickRange = (range: string) => {
    const now = new Date();
    let start: Date;
    const end: Date = new Date();

    switch (range) {
      case 'today':
        start = new Date();
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'quarter': {
        const quarter = Math.floor(end.getMonth() / 3);
        start = new Date(end.getFullYear(), quarter * 3, 1);
        break;
      }
      case 'year':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      default:
        start = firstDayOfMonth;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleExportCSV = async (type: 'sales' | 'expenses' | 'ingredients') => {
    try {
      const csv = await reportsApi.exportCSV(type, startDate, endDate);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${startDate}-to-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportExcel = async (type: 'sales' | 'expenses') => {
    try {
      const blob = await reportsApi.exportExcel(type, startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${startDate}-to-${endDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  // Derived data from API responses
  const cogsData = cogsReport?.byRecipe ?? [];
  const expenseData = stats?.byCategory ?? [];
  const profitData = profitSummary?.recipes ?? [];

  const totalCOGS = cogsReport?.summary.totalCOGS ?? 0;
  const totalExpenses = stats?.total ?? 0;
  const totalProfit = profitSummary?.totals.profit ?? 0;
  const totalRevenue = profitSummary?.totals.revenue ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive financial analysis and business analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportExcel('sales')}>
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportExcel('expenses')}>
            <Download className="h-4 w-4 mr-2" />
            Export Expenses
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card className="border-none p-0 m-0 shadow-none bg-white">
        <CardContent className="p-0 mb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickRange('today')}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('week')}>
                This Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('month')}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('quarter')}>
                This Quarter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('year')}>
                This Year
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-200 w-40"
              />
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-200 w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )} */}

      {/* Report Tabs */}
      <TooltipProvider>
        <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as ReportType)}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="cogs" className="gap-2">
              <Package className="h-4 w-4" />
              COGS
            </TabsTrigger>
            <TabsTrigger value="expense" className="gap-2">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-2">
              <FileText className="h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="profit" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Profit
            </TabsTrigger>
          </TabsList>

          {/* COGS Report - Redesigned */}
          <TabsContent value="cogs" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        Total COGS
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              COGS = Beginning Inventory + Purchases − Ending Inventory
                            </p>
                            <p className="text-gray-300 mt-1">
                              Where: Beginning Inventory = Raw Materials + Packaging at start;
                              Purchases = Ingredients + Packaging bought; Ending Inventory = Unused
                              materials at end
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-2xl font-bold text-gray-900 cursor-help">
                            {formatCurrency(totalCOGS)}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-sm">
                          <p className="font-semibold mb-1">Cost of Goods Sold Formula:</p>
                          <p className="text-gray-300">
                            COGS = Beginning Inventory + Purchases − Ending Inventory
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <Package className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        Total Sales Revenue
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              Revenue = Food Sales + Beverage Sales + Catering Sales + Delivery
                              Sales
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(cogsReport?.summary.totalRevenue ?? 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        Gross Profit
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p className="font-semibold">Gross Profit = Sales Revenue − COGS</p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(cogsReport?.summary.grossProfit ?? 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        Gross Margin
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              Gross Margin = (Net Sales - COGS) / Net Sales × 100
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-midgreenz)]">
                        {(cogsReport?.summary.grossProfitMargin ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <PieChartIcon className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* COGS Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-lightgreenz" />
                      COGS by Recipe
                    </CardTitle>
                    <CardDescription>Production costs breakdown per recipe</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV('sales')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cogsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Recipe</TableHead>
                          <TableHead className="text-center font-semibold">Qty Sold</TableHead>
                          <TableHead className="text-right font-semibold">Revenue</TableHead>
                          <TableHead className="text-right font-semibold">
                            <span className="flex items-center justify-end gap-1">
                              COGS
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  <p className="font-semibold">
                                    Recipe Cost = ∑ (Ingredient Qty Used × Cost per Unit)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            <span className="flex items-center justify-end gap-1">
                              Profit
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  <p className="font-semibold">Profit = Revenue − COGS</p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cogsData.map((row, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{row.recipeName}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{row.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(row.revenue)}
                            </TableCell>
                            <TableCell className="text-right text-orange-600">
                              {formatCurrency(row.cogs)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(row.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No COGS data available for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Report - Redesigned */}
          <TabsContent value="expense" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        Total Operating Expenses
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              OPEX = Rent + Utilities + Electricity + Water + Gas + Salaries +
                              Marketing + Supplies + Maintenance + Insurance & Licenses + Other
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalExpenses)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{expenseData.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <PieChartIcon className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Avg per Category</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalExpenses / (expenseData.length || 1))}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--color-lightgreenz)]/15 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-[var(--color-lightgreenz)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Chart Section */}
              <Card className="md:col-span-1 border">
                <CardHeader>
                  <CardTitle>Expense Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseData.length > 0 ? (
                    <div className="h-[300px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData.map((e) => ({
                              name: e.category,
                              value: Number(e.amount),
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {expenseData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={EXPENSE_COLORS[entry.category] || '#6b7280'}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: any) => [formatCurrency(Number(value)), '']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(totalExpenses)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      No expense data
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed List */}
              <Card className="md:col-span-2 border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Category Breakdown</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportExcel('expenses')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {expenseData.length > 0 ? (
                      expenseData.map((expense, idx) => {
                        const percentage =
                          totalExpenses > 0
                            ? ((Number(expense.amount) / totalExpenses) * 100).toFixed(1)
                            : '0';
                        const color = EXPENSE_COLORS[expense.category] || '#6b7280';
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {CATEGORY_LABELS[expense.category] || expense.category}
                                </p>
                                <p className="text-xs text-gray-500">{percentage}%</p>
                              </div>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(Number(expense.amount))}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No expense data available</p>
                        <Button variant="link" asChild className="mt-2">
                          <Link to="/dashboard/expenses/new">Add your first expense</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Behavior Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Variable Costs */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Variable Costs
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs text-xs">
                        <p className="font-semibold">
                          Variable Cost = COGS + Variable Operating Expenses
                        </p>
                        <p className="text-gray-300 mt-1">
                          Where: COGS = Cost of ingredients & packaging consumed in sales
                        </p>
                        <p className="text-gray-300">
                          Variable Operating Expenses = Delivery Fees + Transaction Fees + Variable
                          Labor
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(variableCosts?.total ?? 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Variable Costs</p>
                  </div>
                  <div className="space-y-2">
                    {variableCosts?.breakdown &&
                      Object.entries(variableCosts.breakdown)
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span>{formatCurrency(Number(value))}</span>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fixed Costs */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Fixed Costs
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs text-xs">
                        <p className="font-semibold">
                          Fixed Cost = Costs that remain constant regardless of production volume
                        </p>
                        <p className="text-gray-300 mt-1">
                          Includes: Rent + Fixed Salaries + Permits & Licenses + Internet +
                          Depreciation + Equipment + Other
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(fixedCosts?.total ?? 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Fixed Costs</p>
                  </div>
                  <div className="space-y-2">
                    {fixedCosts?.breakdown &&
                      Object.entries(fixedCosts.breakdown)
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span>{formatCurrency(Number(value))}</span>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Income Statement - Redesigned */}
          <TabsContent value="income" className="space-y-6">
            <Card className="border">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Income Statement</CardTitle>
                    <CardDescription>
                      For period {startDate} to {endDate}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportExcel('sales')}>
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y text-sm">
                  {/* Revenue */}
                  <div className="p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                      Revenue
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          <p className="font-semibold">
                            Sales Revenue = Food Sales + Beverage Sales + Catering Sales + Delivery
                            Sales
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </h3>
                    <div className="space-y-3 pl-2">
                      <div className="flex justify-between">
                        <span>Food Sales</span>
                        <span>{formatCurrency(incomeStatement?.revenue?.foodSales ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beverage Sales</span>
                        <span>{formatCurrency(incomeStatement?.revenue?.beverageSales ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Catering Sales</span>
                        <span>{formatCurrency(incomeStatement?.revenue?.cateringSales ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Sales</span>
                        <span>{formatCurrency(incomeStatement?.revenue?.deliverySales ?? 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t text-base text-gray-900">
                        <span>Total Sales Revenue</span>
                        <span>{formatCurrency(incomeStatement?.revenue?.totalRevenue ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* COGS */}
                  <div className="p-6 bg-gray-50/30">
                    <div className="flex justify-between items-center font-medium">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        Cost of Goods Sold
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              COGS = Beginning Inventory + Purchases − Ending Inventory
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </h3>
                      <span>({formatCurrency(incomeStatement?.costOfGoodsSold ?? 0)})</span>
                    </div>
                  </div>

                  {/* Gross Profit */}
                  <div className="p-6 bg-green-50/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">Gross Profit</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs text-xs">
                            <p className="font-semibold">Gross Profit = Sales Revenue − COGS</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          {(incomeStatement?.grossProfitMargin ?? 0).toFixed(1)}% Margin
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(incomeStatement?.grossProfit ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                      Operating Expenses
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          <p className="font-semibold">
                            OPEX = Rent + Utilities + Electricity + Water + Gas + Salaries +
                            Marketing + Supplies + Maintenance + Insurance & Licenses + Other
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </h3>
                    <div className="space-y-3 pl-2">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {/* Manually list common expenses or map if available, currently I see specific ones */}
                        {incomeStatement?.operatingExpenses &&
                          Object.entries(incomeStatement.operatingExpenses)
                            .filter(([key]) => key !== 'total')
                            .map(([key, value]) =>
                              Number(value) > 0 ? (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span>{formatCurrency(Number(value))}</span>
                                </div>
                              ) : null
                            )}
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t text-base text-gray-900">
                        <span>Total Operating Expenses</span>
                        <span>
                          ({formatCurrency(incomeStatement?.operatingExpenses?.total ?? 0)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operating Income */}
                  <div className="p-6 bg-indigo-50/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">Operating Income</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              Operating Income = Gross Profit − Operating Expenses
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(incomeStatement?.operatingIncome ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Other Expenses */}
                  {(incomeStatement?.otherExpenses?.total ?? 0) > 0 && (
                    <div className="p-6 bg-gray-50/30">
                      <div className="flex justify-between items-center font-medium">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          Other Expenses
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              <p className="font-semibold">
                                Other Expenses = Tax Expense + Interest Expense + Depreciation
                                Expense + Bank Charges
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </h3>
                        <span>({formatCurrency(incomeStatement?.otherExpenses?.total ?? 0)})</span>
                      </div>
                    </div>
                  )}

                  {/* Net Profit */}
                  <div
                    className={`p-6 ${Number(incomeStatement?.netProfit ?? 0) >= 0 ? 'bg-green-100/40' : 'bg-red-100/40'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">Net Profit</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs text-xs">
                            <p className="font-semibold">
                              Net Profit = Sales Revenue − COGS − Operating Expenses − Other
                              Expenses
                            </p>
                            <p className="text-gray-300 mt-1">
                              OR: Net Profit = Operating Income − Other Expenses
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <span
                          className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${Number(incomeStatement?.netProfit ?? 0) >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
                        >
                          {(incomeStatement?.netProfitMargin ?? 0).toFixed(1)}% Margin
                        </span>
                      </div>
                      <span
                        className={`text-xl font-bold ${Number(incomeStatement?.netProfit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {formatCurrency(incomeStatement?.netProfit ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Summary - Redesigned */}
          <TabsContent value="profit" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border">
                <CardContent className="pt-5">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    Total Revenue
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        <p className="font-semibold">
                          Revenue = Food Sales + Beverage Sales + Catering Sales + Delivery Sales
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    Net Profit
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        <p className="font-semibold">
                          Profit = Revenue − COGS − Operating Expenses
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p
                    className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(totalProfit)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    Profit Margin
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        <p className="font-semibold">Profit Margin = (Profit ÷ Revenue) × 100</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p
                    className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-5">
                  <p className="text-sm text-gray-500 mb-1">Profitable Recipes</p>
                  <p className="text-2xl font-bold text-[var(--color-midgreenz)]">
                    {profitData.filter((r) => r.profit > 0).length} / {profitData.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Profit by Recipe */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Profitability by Recipe
                    </CardTitle>
                    <CardDescription>Profit analysis for each recipe</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {profitData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Recipe</TableHead>
                          <TableHead className="text-right font-semibold">Revenue</TableHead>
                          <TableHead className="text-right font-semibold">
                            <span className="flex items-center justify-end gap-1">
                              Cost
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  <p className="font-semibold">
                                    Recipe Cost = ∑ (Ingredient Qty Used × Cost per Unit)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            <span className="flex items-center justify-end gap-1">
                              Profit
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  <p className="font-semibold">Profit = Revenue − COGS</p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            <span className="flex items-center justify-end gap-1">
                              Margin
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  <p className="font-semibold">Margin = (Profit ÷ Revenue) × 100</p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TableHead>
                          <TableHead className="text-center font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profitData.map((row, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{row.recipeName}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(row.revenue)}
                            </TableCell>
                            <TableCell className="text-right text-orange-600">
                              {formatCurrency(row.costOfGoods)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(row.profit)}
                            </TableCell>
                            <TableCell
                              className={`text-right ${row.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    {row.profitMargin.toFixed(1)}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Margin = (Profit ÷ Revenue) × 100</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-center">
                              {row.profitMargin >= 20 ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                  Healthy
                                </Badge>
                              ) : row.profitMargin >= 0 ? (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                  Low
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                  Loss
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No sales data available for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {(profitData.some((r) => r.profitMargin < 0) ||
              profitData.some((r) => r.profitMargin >= 0 && r.profitMargin < 20)) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profitData
                    .filter((r) => r.profitMargin < 0)
                    .map((recipe, idx) => (
                      <div
                        key={`loss-${idx}`}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                      >
                        <TrendingDown className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-800">
                            {recipe.recipeName} is at a loss
                          </p>
                          <p className="text-sm text-red-600">
                            Increase price by {formatCurrency(Math.abs(recipe.profit))} or reduce
                            costs.
                          </p>
                        </div>
                      </div>
                    ))}
                  {profitData
                    .filter((r) => r.profitMargin >= 0 && r.profitMargin < 20)
                    .map((recipe, idx) => (
                      <div
                        key={`low-${idx}`}
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                      >
                        <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-800">
                            {recipe.recipeName} has low margin ({recipe.profitMargin.toFixed(1)}%)
                          </p>
                          <p className="text-sm text-amber-600">
                            Consider optimizing costs or adjusting pricing for 20%+ margin.
                          </p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </TooltipProvider>

      {/* Quick Links */}
      <Card className="border shadow-none bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/purchases">
                <Truck className="h-4 w-4 mr-2" />
                Manage Purchases
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/inventory">
                <Warehouse className="h-4 w-4 mr-2" />
                Manage Inventory
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/expenses">
                <Receipt className="h-4 w-4 mr-2" />
                View Expenses
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/sales">
                <DollarSign className="h-4 w-4 mr-2" />
                View Sales
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
