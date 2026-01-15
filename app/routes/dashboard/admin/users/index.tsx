import { useState } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  ShoppingCart,
  Receipt,
  ChefHat,
  Package,
  Eye,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useAdminUsers, useAdminUserDetails } from '~/hooks';
import { useAuthStore } from '~/stores/authStore';
import { useToast } from '~/hooks/use-toast';
import { useNavigate } from 'react-router';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `User Management - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Manage all users' },
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const limit = 10;
  const { startImpersonation } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data, isLoading } = useAdminUsers(page, limit, search);
  const { data: userDetails, isLoading: detailsLoading } = useAdminUserDetails(
    selectedUserId ?? ''
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewAsUser = (userId: string, userName: string) => {
    startImpersonation(userId);
    toast({
      title: 'Impersonation Started',
      description: `You are now viewing as ${userName}. All actions will be performed as this user.`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
              <CardDescription>{data?.pagination.total ?? 0} total users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead className="text-center">Recipes</TableHead>
                      <TableHead className="text-center">Sales</TableHead>
                      <TableHead className="text-center">Inventory</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name || 'Unnamed User'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.business ? (
                            <Badge variant="secondary" className="font-normal">
                              {user.business.businessName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No business</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{user._count.recipes}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{user._count.sales}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{user._count.purchases}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAsUser(user.id, user.name || user.email)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View as User
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserId(user.id)}
                            >
                              Details
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.users || data.users.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-muted-foreground">No users found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>View detailed information about this user</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{userDetails.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{userDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">{formatDateTime(userDetails.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {userDetails.business ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Business Name</p>
                          <p className="font-medium">{userDetails.business.businessName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">
                            {userDetails.business.businessType || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Currency</p>
                          <p className="font-medium">{userDetails.business.currency}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No business profile</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Stats Summary */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(userDetails.stats.totalRevenue)}
                    </p>
                    <p className="text-xs text-green-600">{userDetails.stats.salesCount} sales</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <ChefHat className="h-4 w-4" />
                      <span className="text-sm font-medium">Profit</span>
                    </div>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(userDetails.stats.totalProfit)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-100">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <Receipt className="h-4 w-4" />
                      <span className="text-sm font-medium">Expenses</span>
                    </div>
                    <p className="text-xl font-bold text-red-700">
                      {formatCurrency(userDetails.stats.totalExpenses)}
                    </p>
                    <p className="text-xs text-red-600">
                      {userDetails.stats.expensesCount} expenses
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-100">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Purchases</span>
                    </div>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(userDetails.stats.totalPurchases)}
                    </p>
                    <p className="text-xs text-purple-600">
                      {userDetails.stats.purchasesCount} items
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Tabs */}
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="recipes">Recipes</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="purchases">Purchases</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="mt-4">
                  <div className="space-y-2">
                    {userDetails.sales.length > 0 ? (
                      userDetails.sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{sale.recipe.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(sale.saleDate)} · {sale.quantity}x
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            {formatCurrency(Number(sale.totalPrice))}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-6">No recent sales</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recipes" className="mt-4">
                  <div className="space-y-2">
                    {userDetails.recipes.length > 0 ? (
                      userDetails.recipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{recipe.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {formatCurrency(Number(recipe.sellingPrice))}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-6">No recipes</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                  <div className="space-y-2">
                    {userDetails.expenses.length > 0 ? (
                      userDetails.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} · {formatDate(expense.expenseDate)}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">
                            -{formatCurrency(Number(expense.amount))}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-6">No expenses</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="purchases" className="mt-4">
                  <div className="space-y-2">
                    {userDetails.purchases.length > 0 ? (
                      userDetails.purchases.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{purchase.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(purchase.purchaseDate)} · {purchase.quantity} units
                            </p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">
                            {formatCurrency(Number(purchase.totalCost))}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-6">No purchases</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">User not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
