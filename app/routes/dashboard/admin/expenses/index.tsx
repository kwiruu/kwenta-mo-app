import { useState } from 'react';
import { Receipt, ChevronLeft, ChevronRight, Calendar, PieChart, Repeat } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useAdminExpenses, useAdminExpenseStats } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Expense Management - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Manage all expenses' },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const expenseCategories = [
  'UTILITIES',
  'RENT',
  'SALARIES',
  'MARKETING',
  'MAINTENANCE',
  'SUPPLIES',
  'INSURANCE',
  'TRANSPORTATION',
  'COMMUNICATION',
  'LICENSES',
  'PROFESSIONAL_SERVICES',
  'MISCELLANEOUS',
];

const expenseTypes = ['FIXED', 'VARIABLE', 'PERIODIC'];

const frequencyLabels: Record<string, string> = {
  ONE_TIME: 'One Time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual',
  ANNUAL: 'Annual',
};

export default function AdminExpenses() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const limit = 15;

  const { data: expensesData, isLoading } = useAdminExpenses(
    page,
    limit,
    startDate || undefined,
    endDate || undefined,
    categoryFilter === 'all' ? undefined : categoryFilter,
    typeFilter === 'all' ? undefined : typeFilter
  );
  const { data: stats, isLoading: statsLoading } = useAdminExpenseStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
        <p className="text-muted-foreground">Track and analyze all business expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">All-Time Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(stats?.allTime.amount ?? 0)}
                </div>
                <p className="text-xs text-red-600">{stats?.allTime.count ?? 0} expenses</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.thisMonth.amount ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.thisMonth.count ?? 0} expenses
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fixed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.byType.find((t) => t.type === 'FIXED')?.amount ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variable Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.byType.find((t) => t.type === 'VARIABLE')?.amount ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Expense Records
                    </CardTitle>
                    <CardDescription>
                      {expensesData?.pagination.total ?? 0} expenses
                      {expensesData?.summary && (
                        <span className="ml-2">
                          · Total: {formatCurrency(expensesData.summary.totalAmount)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-auto"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-auto"
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => {
                      setCategoryFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => {
                      setTypeFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {expenseTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expensesData?.expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {expense.description}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {expense.user.name || expense.user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {expense.category.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  expense.type === 'FIXED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : expense.type === 'VARIABLE'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-purple-100 text-purple-700'
                                }
                              >
                                {expense.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {frequencyLabels[expense.frequency] || expense.frequency}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(Number(expense.amount))}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(expense.expenseDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!expensesData?.expenses || expensesData.expenses.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No expenses found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {expensesData && expensesData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {expensesData.pagination.page} of {expensesData.pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= expensesData.pagination.totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-category" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {stats?.byCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                    >
                      <div>
                        <Badge variant="outline">{cat.category.replace(/_/g, ' ')}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{cat.count} expenses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(cat.amount)}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.byCategory || stats.byCategory.length === 0) && (
                    <p className="col-span-2 text-center text-muted-foreground py-8">
                      No data available
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-type" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5" />
                Expenses by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.byType.map((t) => (
                    <div key={t.type} className="p-5 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge
                            className={
                              t.type === 'FIXED'
                                ? 'bg-blue-100 text-blue-700'
                                : t.type === 'VARIABLE'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-purple-100 text-purple-700'
                            }
                          >
                            {t.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.type === 'FIXED'
                              ? 'Recurring fixed expenses (rent, salaries, etc.)'
                              : t.type === 'VARIABLE'
                                ? 'Variable costs that change based on activity'
                                : 'Periodic expenses (quarterly, annual, etc.)'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(t.amount)}</p>
                          <p className="text-sm text-muted-foreground">{t.count} expenses</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!stats?.byType || stats.byType.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
