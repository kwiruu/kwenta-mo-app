import { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
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
import { useAdminSales, useAdminSalesStats } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Sales Management - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Manage all sales' },
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

const saleCategories = ['FOOD', 'BEVERAGE', 'CATERING', 'DELIVERY'];

export default function AdminSales() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const limit = 15;

  const { data: salesData, isLoading } = useAdminSales(
    page,
    limit,
    startDate || undefined,
    endDate || undefined,
    categoryFilter === 'all' ? undefined : categoryFilter
  );
  const { data: stats, isLoading: statsLoading } = useAdminSalesStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <p className="text-muted-foreground">View and analyze all sales transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">All-Time Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats?.allTime.revenue ?? 0)}
                </div>
                <p className="text-xs text-green-600">{stats?.allTime.count ?? 0} sales</p>
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
                  {formatCurrency(stats?.thisMonth.revenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">{stats?.thisMonth.count ?? 0} sales</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.thisWeek.revenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">{stats?.thisWeek.count ?? 0} sales</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats?.dailyAverage ?? 0)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">All Sales</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Sales Transactions
                    </CardTitle>
                    <CardDescription>
                      {salesData?.pagination.total ?? 0} transactions
                      {salesData?.summary && (
                        <span className="ml-2">
                          · Total: {formatCurrency(salesData.summary.totalRevenue)}
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
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {saleCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
                          <TableHead>Recipe</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData?.sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.recipe.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {sale.user.name || sale.user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{sale.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(sale.unitPrice))}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(sale.totalPrice))}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(Number(sale.profit))}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(sale.saleDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!salesData?.sales || salesData.sales.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No sales found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {salesData && salesData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {salesData.pagination.page} of {salesData.pagination.totalPages}
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
                          disabled={page >= salesData.pagination.totalPages}
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
                <TrendingUp className="h-5 w-5" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.byCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                    >
                      <div>
                        <Badge
                          className={
                            cat.category === 'FOOD'
                              ? 'bg-orange-100 text-orange-700'
                              : cat.category === 'BEVERAGE'
                                ? 'bg-blue-100 text-blue-700'
                                : cat.category === 'CATERING'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-green-100 text-green-700'
                          }
                        >
                          {cat.category}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{cat.count} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(cat.revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.byCategory || stats.byCategory.length === 0) && (
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
