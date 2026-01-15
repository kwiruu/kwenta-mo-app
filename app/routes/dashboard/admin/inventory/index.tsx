import { useState } from 'react';
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Filter,
} from 'lucide-react';
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
import { useAdminInventory, useAdminInventoryStats, useAdminInventoryTransactions } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Inventory Management - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Manage all inventory items' },
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

const inventoryTypes = [
  'RAW_MATERIAL',
  'PACKAGING',
  'INGREDIENT',
  'SPICE',
  'CONDIMENT',
  'BEVERAGE',
  'DAIRY',
  'PRODUCE',
  'PROTEIN',
  'GRAIN',
  'OIL',
  'SUPPLY',
  'EQUIPMENT',
  'OTHER',
];

export default function AdminInventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('items');
  const [txPage, setTxPage] = useState(1);
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const limit = 15;

  const { data: inventoryData, isLoading } = useAdminInventory(
    page,
    limit,
    search,
    typeFilter === 'all' ? undefined : typeFilter
  );
  const { data: stats, isLoading: statsLoading } = useAdminInventoryStats();
  const { data: txData, isLoading: txLoading } = useAdminInventoryTransactions(
    txPage,
    limit,
    txTypeFilter === 'all' ? undefined : txTypeFilter
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-muted-foreground">View and manage all inventory items across users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalItems ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue ?? 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-700">{stats?.lowStockCount ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.byType?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Type Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    All Inventory
                  </CardTitle>
                  <CardDescription>{inventoryData?.pagination.total ?? 0} items</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {inventoryTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch}>Search</Button>
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
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryData?.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.itemType.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.user.name || item.user.email}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(item.quantity).toFixed(2)} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(item.unitCost))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(item.totalCost))}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantity) <= Number(item.reorderLevel) ? (
                                <Badge className="bg-amber-100 text-amber-700">Low Stock</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">In Stock</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!inventoryData?.items || inventoryData.items.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No inventory items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {inventoryData && inventoryData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {inventoryData.pagination.page} of{' '}
                        {inventoryData.pagination.totalPages}
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
                          disabled={page >= inventoryData.pagination.totalPages}
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

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All inventory movements</CardDescription>
                </div>
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INITIAL">Initial</SelectItem>
                    <SelectItem value="RESTOCK">Restock</SelectItem>
                    <SelectItem value="SALE">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
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
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                          <TableHead className="text-right">Before → After</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {txData?.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.purchase.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  tx.type === 'RESTOCK'
                                    ? 'bg-green-50 text-green-700'
                                    : tx.type === 'SALE'
                                      ? 'bg-red-50 text-red-700'
                                      : ''
                                }
                              >
                                {tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {tx.purchase.user.name || tx.purchase.user.email}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${Number(tx.quantityChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {Number(tx.quantityChange) >= 0 ? '+' : ''}
                              {Number(tx.quantityChange).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {Number(tx.quantityBefore).toFixed(2)} →{' '}
                              {Number(tx.quantityAfter).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(tx.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!txData?.transactions || txData.transactions.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No transactions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {txData && txData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {txData.pagination.page} of {txData.pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={txPage === 1}
                          onClick={() => setTxPage(txPage - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={txPage >= txData.pagination.totalPages}
                          onClick={() => setTxPage(txPage + 1)}
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

        <TabsContent value="breakdown" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Inventory by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.byType.map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.type.replace('_', ' ')}</Badge>
                        <span className="text-muted-foreground">{item.count} items</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.value)}</span>
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
