import { useState } from 'react';
import {
  ChefHat,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useAdminRecipes, useAdminRecipeStats } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Recipe Management - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Manage all recipes' },
  ];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

export default function AdminRecipes() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 15;

  const { data: recipesData, isLoading } = useAdminRecipes(page, limit, search);
  const { data: stats, isLoading: statsLoading } = useAdminRecipeStats();

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recipe Management</h1>
        <p className="text-muted-foreground">View and manage all recipes across users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalRecipes ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-700">{stats?.activeRecipes ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-700">{stats?.inactiveRecipes ?? 0}</div>
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
              <div className="text-2xl font-bold">{stats?.categories?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recipes">
        <TabsList>
          <TabsTrigger value="recipes">All Recipes</TabsTrigger>
          <TabsTrigger value="top-selling">Top Selling</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    All Recipes
                  </CardTitle>
                  <CardDescription>{recipesData?.pagination.total ?? 0} recipes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search recipes..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9"
                    />
                  </div>
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
                          <TableHead>Recipe</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Selling Price</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Margin</TableHead>
                          <TableHead className="text-center">Sales</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipesData?.recipes.map((recipe) => (
                          <TableRow key={recipe.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{recipe.name}</p>
                                {recipe.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {recipe.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {recipe.user.name || recipe.user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{recipe.category || 'Uncategorized'}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(recipe.sellingPrice))}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(recipe.calculatedCost.totalCost)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  recipe.calculatedCost.margin >= 30
                                    ? 'text-green-600'
                                    : recipe.calculatedCost.margin >= 15
                                      ? 'text-amber-600'
                                      : 'text-red-600'
                                }
                              >
                                {recipe.calculatedCost.margin.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{recipe._count.sales}</Badge>
                            </TableCell>
                            <TableCell>
                              {recipe.isActive ? (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!recipesData?.recipes || recipesData.recipes.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No recipes found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {recipesData && recipesData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {recipesData.pagination.page} of {recipesData.pagination.totalPages}
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
                          disabled={page >= recipesData.pagination.totalPages}
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

        <TabsContent value="top-selling" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Selling Recipes
              </CardTitle>
              <CardDescription>Best performing recipes by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.topSelling.map((recipe, index) => (
                    <div
                      key={recipe.recipeId}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{recipe.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {recipe.quantitySold} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(recipe.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">total revenue</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.topSelling || stats.topSelling.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      No sales data available
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recipe Categories
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats?.categories.map((cat) => (
                    <div key={cat.category} className="p-4 rounded-lg border bg-white">
                      <p className="font-medium">{cat.category}</p>
                      <p className="text-2xl font-bold mt-1">{cat.count}</p>
                      <p className="text-xs text-muted-foreground">recipes</p>
                    </div>
                  ))}
                  {(!stats?.categories || stats.categories.length === 0) && (
                    <p className="text-center text-muted-foreground py-8 col-span-full">
                      No categories found
                    </p>
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
