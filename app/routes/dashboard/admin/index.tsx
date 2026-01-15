import { Link } from 'react-router';
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Receipt,
  ChefHat,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdminStats, useAdminActivity, useAdminLowStock, useAdminRevenueChart } from '~/hooks';
import { APP_CONFIG } from '~/config/app';
import { useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '~/hooks/useAdmin';

export function meta() {
  return [
    { title: `Admin Dashboard - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Admin dashboard overview' },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  loading,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
  href?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}% {changeLabel}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

export default function AdminOverview() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: activity, isLoading: activityLoading } = useAdminActivity(10);
  const { data: lowStock, isLoading: lowStockLoading } = useAdminLowStock(5);
  const { data: chartData, isLoading: chartLoading } = useAdminRevenueChart();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.all });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor your business metrics and activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.overview.totalUsers ?? 0}
          icon={Users}
          loading={statsLoading}
          href="/dashboard/admin/users"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.financial.monthlyRevenue ?? 0)}
          icon={DollarSign}
          change={stats?.financial.revenueChange}
          changeLabel="vs last month"
          loading={statsLoading}
        />
        <StatCard
          title="Inventory Items"
          value={stats?.overview.totalInventoryItems ?? 0}
          icon={Package}
          loading={statsLoading}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.overview.lowStockAlerts ?? 0}
          icon={AlertTriangle}
          loading={statsLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Recipes"
          value={stats?.overview.totalRecipes ?? 0}
          icon={ChefHat}
          loading={statsLoading}
        />
        <StatCard
          title="Total Sales"
          value={stats?.overview.totalSales ?? 0}
          icon={ShoppingCart}
          loading={statsLoading}
        />
        <StatCard
          title="Total Expenses"
          value={stats?.overview.totalExpenses ?? 0}
          icon={Receipt}
          loading={statsLoading}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats?.financial.netProfit ?? 0)}
          icon={TrendingUp}
          loading={statsLoading}
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Revenue (Last 30 Days)</CardTitle>
            <CardDescription>Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-75 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('en-PH', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions across all users</CardDescription>
            </div>
            <Link to="/dashboard/admin/activity">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activity?.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          item.type === 'sale'
                            ? 'bg-green-100 text-green-600'
                            : item.type === 'expense'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {item.type === 'sale' ? (
                          <ShoppingCart className="h-4 w-4" />
                        ) : item.type === 'expense' ? (
                          <Receipt className="h-4 w-4" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={item.type === 'sale' ? 'default' : 'secondary'}
                      className={
                        item.type === 'sale'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : item.type === 'expense'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : ''
                      }
                    >
                      {item.type === 'expense' ? '-' : '+'}
                      {formatCurrency(item.amount)}
                    </Badge>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Owner: {item.userName || item.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-amber-600">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reorder at: {item.reorderLevel} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
              {(!lowStock || lowStock.length === 0) && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">All stock levels are healthy!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
