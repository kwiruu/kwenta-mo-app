import { Link } from 'react-router';
import { useState, useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
  CameraIcon,
  HandCoins,
  PhilippinePeso,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { APP_CONFIG } from '~/config/app';
import {
  useIngredients,
  useSales,
  useDashboardSummary,
  useChartData,
  useLowStockAlerts,
  useExpenseStats,
} from '~/hooks';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function meta() {
  return [
    { title: `Dashboard - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Overview of your business performance' },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [statsTab, setStatsTab] = useState<'expenses' | 'sales'>('expenses');

  // Use TanStack Query hooks - data is cached and shared across components
  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary();
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useLowStockAlerts();
  const { data: expenseStats, isLoading: expenseStatsLoading } = useExpenseStats();

  // Fetch all chart periods on load so switching is instant
  const { data: dailyChart, isLoading: dailyLoading } = useChartData('daily');
  const { data: weeklyChart, isLoading: weeklyLoading } = useChartData('weekly');
  const { data: monthlyChart, isLoading: monthlyLoading } = useChartData('monthly');

  const isLoading =
    ingredientsLoading ||
    salesLoading ||
    dashboardLoading ||
    dailyLoading ||
    lowStockLoading ||
    expenseStatsLoading;

  // Calculate sales by category
  const salesByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    sales.forEach((sale) => {
      const category = sale.category || 'FOOD';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(sale.totalPrice);
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [sales]);

  // Chart colors for categories
  const EXPENSE_COLORS: Record<string, string> = {
    INGREDIENTS: '#10b981',
    PACKAGING: '#34d399',
    DELIVERY_FEES: '#6ee7b7',
    TRANSACTION_FEES: '#059669',
    RENT: '#047857',
    UTILITIES: '#22c55e',
    ELECTRICITY: '#4ade80',
    WATER: '#86efac',
    GAS: '#16a34a',
    SALARIES: '#15803d',
    MARKETING: '#166534',
    SUPPLIES: '#14532d',
    MAINTENANCE: '#84cc16',
    INSURANCE_LICENSES: '#65a30d',
    FIXED_SALARIES: '#4d7c0f',
    DEPRECIATION: '#3f6212',
    PERMITS_LICENSES: '#a3e635',
    INTERNET: '#bef264',
    TAX_EXPENSE: '#d9f99d',
    INTEREST_EXPENSE: '#10b981',
    BANK_CHARGES: '#34d399',
    LABOR: '#6ee7b7',
    EQUIPMENT: '#059669',
    TRANSPORTATION: '#047857',
    OTHER: '#6b7280',
  };

  const SALES_COLORS: Record<string, string> = {
    FOOD: '#22c55e',
    BEVERAGE: '#10b981',
    CATERING: '#34d399',
    DELIVERY: '#6ee7b7',
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
    GAS: 'Gas',
    SALARIES: 'Salaries',
    MARKETING: 'Marketing',
    SUPPLIES: 'Supplies',
    MAINTENANCE: 'Maintenance',
    INSURANCE_LICENSES: 'Insurance & Licenses',
    FIXED_SALARIES: 'Fixed Salaries',
    DEPRECIATION: 'Depreciation',
    PERMITS_LICENSES: 'Permits & Licenses',
    INTERNET: 'Internet',
    TAX_EXPENSE: 'Tax Expense',
    INTEREST_EXPENSE: 'Interest Expense',
    BANK_CHARGES: 'Bank Charges',
    LABOR: 'Labor',
    EQUIPMENT: 'Equipment',
    TRANSPORTATION: 'Transportation',
    OTHER: 'Other',
    FOOD: 'Food',
    BEVERAGE: 'Beverage',
    CATERING: 'Catering',
    DELIVERY: 'Delivery',
  };

  // Get chart data based on selected period (no refetch needed)
  const chartData = (() => {
    switch (selectedPeriod) {
      case 'daily':
        return dailyChart?.data ?? [];
      case 'weekly':
        return weeklyChart?.data ?? [];
      case 'monthly':
        return monthlyChart?.data ?? [];
      default:
        return [];
    }
  })();

  // Get recent sales
  const recentSales = sales.slice(0, 5);

  // KPI data from API or defaults
  const kpiData = {
    totalRevenue: dashboardData?.currentMonth.revenue ?? 0,
    totalExpenses: dashboardData?.currentMonth.expenses ?? 0,
    grossProfit: dashboardData?.currentMonth.grossProfit ?? 0,
    netProfit: dashboardData?.currentMonth.netProfit ?? 0,
    profitMargin: dashboardData?.currentMonth.revenue
      ? (dashboardData.currentMonth.grossProfit / dashboardData.currentMonth.revenue) * 100
      : 0,
    revenueChange: dashboardData?.changes.revenue ?? 0,
    expenseChange: dashboardData?.changes.expenses ?? 0,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center pt-20">
          <div className="h-64 mx-auto">
            <DotLottieReact src="/assets/loading.lottie" loop autoplay />
          </div>
          <p className="-mt-12 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-greenz">
            <Link to="/dashboard/sales/new">
              <Plus className="h-4 w-4 mr-2" />
              Record Sale
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <PhilippinePeso className="h-4 w-4 text-lightgreenz" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(kpiData.totalRevenue)}
            </div>
            <div className="flex items-center text-xs mt-2">
              <TrendingUp className="h-3 w-3 mr-1 text-lightgreenz" />
              <span className="text-lightgreenz font-medium">+{kpiData.revenueChange}%</span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-lightgreenz/20 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-lightgreenz" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(kpiData.totalExpenses)}
            </div>
            <div className="flex items-center text-xs mt-2">
              <TrendingDown className="h-3 w-3 mr-1 text-lightgreenz" />
              <span className="text-lightgreenz font-medium">{kpiData.expenseChange}%</span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Gross Profit</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-lightgreenz/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-lightgreenz" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(kpiData.grossProfit)}
            </div>
            <p className="text-xs text-gray-400 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Profit Margin</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-lightgreenz" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {kpiData.profitMargin.toFixed(2)}%
            </div>
            <p className="text-xs mt-2">
              {kpiData.profitMargin > 20 ? (
                <span className="text-lightgreenz font-medium">Healthy margin</span>
              ) : kpiData.profitMargin > 10 ? (
                <span className="text-amber-500 font-medium">Fair margin</span>
              ) : (
                <span className="text-red-500 font-medium">Low margin - review costs</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Stats Row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Revenue & Expenses Chart */}
        <Card className="border bg-white shadow-none lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Revenue & Expenses Overview</CardTitle>
                <CardDescription className="text-gray-500">
                  Track your revenue and expenses over time
                </CardDescription>
              </div>
              <Tabs
                value={selectedPeriod}
                onValueChange={(value) =>
                  setSelectedPeriod(value as 'daily' | 'weekly' | 'monthly')
                }
              >
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.459 0.087 201.746)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.459 0.087 201.746)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.642 0.235 27.325)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.642 0.235 27.325)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | string | undefined) => [
                      value !== undefined ? `₱${Number(value).toLocaleString()}` : '',
                      '',
                    ]}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.459 0.087 201.746)"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="oklch(0.642 0.235 27.325)"
                    strokeWidth={2}
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Statistics with Ring Charts */}
        <Card className="border bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900">Statistics</CardTitle>
            <CardDescription className="text-gray-500">Category breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={statsTab} onValueChange={(v) => setStatsTab(v as 'expenses' | 'sales')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="mt-0">
                {expenseStats?.byCategory && expenseStats.byCategory.length > 0 ? (
                  <>
                    {/* Ring Chart */}
                    <div className="h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseStats.byCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="amount"
                            nameKey="category"
                          >
                            {expenseStats.byCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={EXPENSE_COLORS[entry.category] || '#6b7280'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [formatCurrency(Number(value)), '']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Total */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(expenseStats.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category Legend */}
                    <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto">
                      {expenseStats.byCategory.map((item, index) => {
                        const percentage =
                          expenseStats.total > 0
                            ? ((item.amount / expenseStats.total) * 100).toFixed(1)
                            : '0';
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: EXPENSE_COLORS[item.category] || '#6b7280',
                                }}
                              />
                              <span className="text-gray-600">
                                {CATEGORY_LABELS[item.category] || item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-medium">
                                {formatCurrency(item.amount)}
                              </span>
                              <span className="text-gray-400 text-xs w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-gray-500">
                    No expense data available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                {salesByCategory.length > 0 ? (
                  <>
                    {/* Ring Chart */}
                    <div className="h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="amount"
                            nameKey="category"
                          >
                            {salesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={SALES_COLORS[entry.category] || '#6b7280'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [formatCurrency(Number(value)), '']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Total */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(
                              salesByCategory.reduce((sum, item) => sum + item.amount, 0)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category Legend */}
                    <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto">
                      {(() => {
                        const totalSales = salesByCategory.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        return salesByCategory.map((item, index) => {
                          const percentage =
                            totalSales > 0 ? ((item.amount / totalSales) * 100).toFixed(1) : '0';
                          return (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: SALES_COLORS[item.category] || '#6b7280',
                                  }}
                                />
                                <span className="text-gray-600">
                                  {CATEGORY_LABELS[item.category] || item.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-medium">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="text-gray-400 text-xs w-12 text-right">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-gray-500">
                    No sales data available
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="border-t mt-4 pt-4">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard/reports">
                  View Full Report
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Quick Actions Row */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card className="border bg-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-gray-500">
              Ingredients that need to be restocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} remaining
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Low Stock
                    </Badge>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link to="/dashboard/ingredients">
                    Manage Inventory
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">All stock levels are healthy!</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border bg-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Recent Sales
            </CardTitle>
            <CardDescription className="text-gray-500">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.recipe?.name ?? 'Unknown Recipe'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.quantity} units • {new Date(sale.saleDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-lightgreenz">
                      {formatCurrency(sale.totalPrice)}
                    </span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link to="/dashboard/sales">
                    View All Sales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No sales recorded yet</p>
                <Button asChild>
                  <Link to="/dashboard/sales/new">Record First Sale</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-gray-500">
            Common tasks to manage your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              asChild
            >
              <Link to="/dashboard/ingredients/new">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className="text-gray-700">Add Ingredient</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              asChild
            >
              <Link to="/dashboard/expenses/new">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-gray-700">Record Expense</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              asChild
            >
              <Link to="/dashboard/scan-receipt">
                <div className="h-10 w-10 rounded-lg bg-lightgreenz/10 flex items-center justify-center">
                  <CameraIcon className="h-5 w-5 text-lightgreenz" />
                </div>
                <span className="text-gray-700">Scan Receipt</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              asChild
            >
              <Link to="/dashboard/reports">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-gray-700">View Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
