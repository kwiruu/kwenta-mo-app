import { Link } from 'react-router';
import { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useSales, useSalesStats, useDeleteSale } from '~/hooks';
import type { Sale } from '~/lib/api';

export default function SalesIndex() {
  const { data: sales = [], isLoading } = useSales();
  const { data: stats } = useSalesStats();
  const deleteSaleMutation = useDeleteSale();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sale record?')) {
      deleteSaleMutation.mutate(id);
    }
  };

  // Filter by search and date
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.recipe?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (dateFilter === 'all') return matchesSearch;

    const saleDate = new Date(sale.saleDate);
    const now = new Date();

    if (dateFilter === 'today') {
      return matchesSearch && saleDate.toDateString() === now.toDateString();
    }

    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return matchesSearch && saleDate >= weekAgo;
    }

    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      return matchesSearch && saleDate >= monthAgo;
    }

    return matchesSearch;
  });

  // Use stats if available, otherwise calculate from filtered sales
  // Note: API returns Decimal fields as strings, so we convert to Number
  const totalRevenue =
    stats?.totalRevenue ?? filteredSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
  const totalProfit =
    stats?.totalProfit ?? filteredSales.reduce((sum, s) => sum + Number(s.profit), 0);
  const totalQuantity = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  // Show loading state
  if (isLoading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center pt-20">
          <div className="h-64 mx-auto">
            <DotLottieReact src="/assets/file_search.lottie" loop autoplay />
          </div>
          <p className="-mt-12 text-gray-500">Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Track and manage your daily sales</p>
        </div>
        <Button variant="green" asChild>
          <Link to="/dashboard/sales/new">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Record Sale
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search by recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'today', 'week', 'month'] as const).map((filter) => (
            <Button
              key={filter}
              variant={dateFilter === filter ? 'green' : 'outline'}
              size="sm"
              onClick={() => setDateFilter(filter)}
            >
              {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Items Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div
              className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}
            >
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Total Profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>View all your sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead className="text-center">Yields</TableHead>
                  <TableHead className="text-right">Price/Yield</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => {
                  const saleProfit = Number(sale.profit);
                  const isProfitable = saleProfit >= 0;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{formatDate(sale.saleDate)}</TableCell>
                      <TableCell>{sale.recipe?.name ?? '—'}</TableCell>
                      <TableCell className="text-center">{sale.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(sale.unitPrice))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(sale.totalPrice))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(Number(sale.costOfGoods))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isProfitable ? 'lightgreen' : 'destructive'}>
                          {formatCurrency(saleProfit)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/dashboard/sales/edit/${sale.id}`}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold">No sales recorded</h3>
              <p className="mt-2 text-muted-foreground">
                Start recording your sales to track revenue and profits.
              </p>
              <Button className="mt-4" variant="green" asChild>
                <Link to="/dashboard/sales/new">Record First Sale</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
