import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Skeleton } from '~/components/ui/skeleton';
import { useAdminFinancialSummary } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Financial Reports - ${APP_CONFIG.name}` },
    { name: 'description', content: 'View financial reports and analytics' },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AdminReports() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const { data: financial, isLoading } = useAdminFinancialSummary(startDate, endDate);

  const isProfit = (financial?.profit.net ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-muted-foreground">Profit & Loss statements and financial analytics</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = new Date(today.getFullYear(), today.getMonth(), 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const end = new Date(today.getFullYear(), today.getMonth(), 0);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = new Date(today.getFullYear(), 0, 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
              >
                This Year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(financial?.revenue.total ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Cost of Goods Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-orange-700">
                {formatCurrency(financial?.costs.cogs ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(financial?.costs.operatingExpenses ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={isProfit ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}>
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center gap-2 ${isProfit ? 'text-blue-600' : 'text-red-600'}`}
            >
              <DollarSign className="h-4 w-4" />
              Net Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div
                className={`text-2xl font-bold flex items-center gap-1 ${isProfit ? 'text-blue-700' : 'text-red-700'}`}
              >
                {isProfit ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                {formatCurrency(Math.abs(financial?.profit.net ?? 0))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit & Loss Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profit & Loss Statement
          </CardTitle>
          <CardDescription>
            For the period{' '}
            {new Date(startDate).toLocaleDateString('en-PH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            to{' '}
            {new Date(endDate).toLocaleDateString('en-PH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Revenue</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                    <span>Sales Revenue ({financial?.revenue.salesCount ?? 0} sales)</span>
                    <span className="font-medium">
                      {formatCurrency(financial?.revenue.total ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 px-3 font-bold text-green-600">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(financial?.revenue.total ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Cost of Goods Sold</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                    <span>Direct Materials & Ingredients</span>
                    <span className="font-medium">
                      {formatCurrency(financial?.costs.cogs ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 px-3 font-bold text-orange-600">
                    <span>Total COGS</span>
                    <span>{formatCurrency(financial?.costs.cogs ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">Gross Profit</span>
                    <p className="text-sm text-muted-foreground">Revenue - COGS</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xl text-blue-600">
                      {formatCurrency(financial?.profit.gross ?? 0)}
                    </span>
                    <p className="text-sm text-blue-600">
                      Margin: {formatPercent(financial?.profit.grossMargin ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Section */}
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Operating Expenses</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                    <span>Total Operating Expenses</span>
                    <span className="font-medium">
                      {formatCurrency(financial?.costs.operatingExpenses ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 px-3 font-bold text-red-600">
                    <span>Total Operating Expenses</span>
                    <span>{formatCurrency(financial?.costs.operatingExpenses ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`rounded-lg p-4 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">
                      {isProfit ? 'Net Profit' : 'Net Loss'}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Gross Profit - Operating Expenses
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold text-2xl ${isProfit ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(Math.abs(financial?.profit.net ?? 0))}
                    </span>
                    <p className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      Net Margin: {formatPercent(financial?.profit.netMargin ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <CardDescription>Revenue retained after COGS</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-3xl font-bold text-blue-600">
                {formatPercent(financial?.profit.grossMargin ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
            <CardDescription>Revenue retained after all expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div
                className={`text-3xl font-bold ${(financial?.profit.netMargin ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercent(financial?.profit.netMargin ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <CardDescription>Operating expenses as % of revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-3xl font-bold text-orange-600">
                {formatPercent(
                  financial?.revenue.total
                    ? ((financial?.costs.operatingExpenses ?? 0) / financial.revenue.total) * 100
                    : 0
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
