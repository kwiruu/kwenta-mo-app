import { Link } from "react-router";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
  CameraIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { APP_CONFIG } from "~/config/app";
import {
  useIngredients,
  useSales,
  useDashboardSummary,
  useChartData,
  useLowStockAlerts,
} from "~/hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function meta() {
  return [
    { title: `Dashboard - ${APP_CONFIG.name}` },
    { name: "description", content: "Overview of your business performance" },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  // Use TanStack Query hooks - data is cached and shared across components
  const { data: ingredients = [], isLoading: ingredientsLoading } =
    useIngredients();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboardSummary();
  const { data: lowStockItems = [], isLoading: lowStockLoading } =
    useLowStockAlerts();

  // Fetch all chart periods on load so switching is instant
  const { data: dailyChart, isLoading: dailyLoading } = useChartData("daily");
  const { data: weeklyChart, isLoading: weeklyLoading } =
    useChartData("weekly");
  const { data: monthlyChart, isLoading: monthlyLoading } =
    useChartData("monthly");

  const isLoading =
    ingredientsLoading ||
    salesLoading ||
    dashboardLoading ||
    dailyLoading ||
    lowStockLoading;

  // Get chart data based on selected period (no refetch needed)
  const chartData = (() => {
    switch (selectedPeriod) {
      case "daily":
        return dailyChart?.data ?? [];
      case "weekly":
        return weeklyChart?.data ?? [];
      case "monthly":
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
      ? (dashboardData.currentMonth.grossProfit /
          dashboardData.currentMonth.revenue) *
        100
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your business overview.
          </p>
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
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-greenz/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-greenz" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(kpiData.totalRevenue)}
            </div>
            <div className="flex items-center text-xs mt-2">
              <TrendingUp className="h-3 w-3 mr-1 text-lightgreenz" />
              <span className="text-lightgreenz font-medium">
                +{kpiData.revenueChange}%
              </span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Expenses
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(kpiData.totalExpenses)}
            </div>
            <div className="flex items-center text-xs mt-2">
              <TrendingDown className="h-3 w-3 mr-1 text-lightgreenz" />
              <span className="text-lightgreenz font-medium">
                {kpiData.expenseChange}%
              </span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Gross Profit
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-500">
              Profit Margin
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {kpiData.profitMargin.toFixed(2)}%
            </div>
            <p className="text-xs mt-2">
              {kpiData.profitMargin > 20 ? (
                <span className="text-lightgreenz font-medium">
                  Healthy margin
                </span>
              ) : kpiData.profitMargin > 10 ? (
                <span className="text-amber-500 font-medium">Fair margin</span>
              ) : (
                <span className="text-red-500 font-medium">
                  Low margin - review costs
                </span>
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
                <CardTitle className="text-gray-900">
                  Revenue & Expenses Overview
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Track your revenue and expenses over time
                </CardDescription>
              </div>
              <Tabs
                value={selectedPeriod}
                onValueChange={(value) =>
                  setSelectedPeriod(value as "daily" | "weekly" | "monthly")
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
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.459 0.087 201.746)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.459 0.087 201.746)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.642 0.235 27.325)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.642 0.235 27.325)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number | string | undefined) => [
                      value !== undefined
                        ? `₱${Number(value).toLocaleString()}`
                        : "",
                      "",
                    ]}
                    labelStyle={{ color: "#374151", fontWeight: 600 }}
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

        {/* Report Stats */}
        <Card className="border bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Stats</CardTitle>
            <CardDescription className="text-gray-500">
              Key metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Sales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Sales</p>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  This Month
                </Badge>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(kpiData.totalRevenue)}
              </p>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-lightgreenz" />
                <span className="text-lightgreenz font-medium">
                  +{kpiData.revenueChange}%
                </span>
                <span className="ml-1 text-gray-400">vs last month</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-2">
              <p className="text-sm text-gray-500">Total Costs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(kpiData.totalExpenses)}
              </p>
              <div className="flex items-center text-xs">
                <TrendingDown className="h-3 w-3 mr-1 text-lightgreenz" />
                <span className="text-lightgreenz font-medium">
                  {kpiData.expenseChange}%
                </span>
                <span className="ml-1 text-gray-400">vs last month</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-2">
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(kpiData.grossProfit)}
              </p>
              <div className="flex items-center text-xs">
                <span className="text-gray-500">Margin: </span>
                <span className="ml-1 font-medium text-gray-900">
                  {kpiData.profitMargin}%
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
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
                        {item.currentStock} {item.unit} remaining (min:{" "}
                        {item.reorderLevel})
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
              <p className="text-gray-500 text-center py-4">
                All stock levels are healthy!
              </p>
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
            <CardDescription className="text-gray-500">
              Your latest transactions
            </CardDescription>
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
                        {sale.recipe?.name ?? "Unknown Recipe"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.quantity} units •{" "}
                        {new Date(sale.saleDate).toLocaleDateString()}
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
