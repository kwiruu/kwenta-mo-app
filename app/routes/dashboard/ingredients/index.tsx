import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useIngredients, useDeleteIngredient } from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { Ingredient } from "~/lib/api";

export function meta() {
  return [
    { title: `Ingredients - ${APP_CONFIG.name}` },
    { name: "description", content: "Manage your ingredients inventory" },
  ];
}

export default function IngredientsListPage() {
  const navigate = useNavigate();
  const { data: ingredients = [], isLoading } = useIngredients();
  const deleteIngredientMutation = useDeleteIngredient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = ingredients.filter(
    (i) => Number(i.currentStock) <= Number(i.reorderLevel)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      deleteIngredientMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    const currentStock = Number(ingredient.currentStock);
    const reorderLevel = Number(ingredient.reorderLevel);

    if (currentStock <= 0) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Out of Stock
        </Badge>
      );
    }
    if (currentStock <= reorderLevel) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge className="bg-lightgreenz/10 text-lightgreenz hover:bg-secondary/10 border-0">
        In Stock
      </Badge>
    );
  };

  // Show loading state
  if (isLoading && ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center pt-20">
          <div className="h-64 mx-auto">
            <DotLottieReact src="/assets/loading.lottie" loop autoplay />
          </div>
          <p className="-mt-12 text-gray-500">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ingredients</h1>
          <p className="text-gray-500 mt-1">
            Manage your raw materials and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
            asChild
          >
            <Link to="/dashboard/ingredients/upload">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
          <Button variant="green" asChild>
            <Link to="/dashboard/ingredients/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Link>
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-100 bg-amber-50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600 text-sm">
              {lowStockItems.length} item(s) need restocking:{" "}
              {lowStockItems
                .slice(0, 3)
                .map((i) => i.name)
                .join(", ")}
              {lowStockItems.length > 3 &&
                ` and ${lowStockItems.length - 3} more`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-gray-200"
          />
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Total: {ingredients.length} items</span>
          <span className="text-amber-600">
            Low Stock: {lowStockItems.length}
          </span>
        </div>
      </div>

      {/* Ingredients Table */}
      <Card className="border shadow-none bg-white">
        <CardContent className="p-0">
          {filteredIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No ingredients found
              </h3>
              <p className="text-gray-500 mb-4 max-w-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by adding your first ingredient or uploading from a file."}
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-200" asChild>
                    <Link to="/dashboard/ingredients/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Link>
                  </Button>
                  <Button variant="green" asChild>
                    <Link to="/dashboard/ingredients/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manually
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium pl-4">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-500 font-medium">
                    Unit
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-medium">
                    Price/Unit
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-medium">
                    Stock
                  </TableHead>
                  <TableHead className="text-gray-500 font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-500 font-medium">
                    Supplier
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-medium pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => (
                  <TableRow key={ingredient.id} className="border-gray-100">
                    <TableCell className="font-medium text-gray-900 pl-4">
                      {ingredient.name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {ingredient.unit}
                    </TableCell>
                    <TableCell className="text-right text-gray-900">
                      {formatCurrency(ingredient.costPerUnit)}
                    </TableCell>
                    <TableCell className="text-right text-gray-900">
                      {ingredient.currentStock} {ingredient.unit}
                    </TableCell>
                    <TableCell>{getStockStatus(ingredient)}</TableCell>
                    <TableCell className="text-gray-500">
                      {ingredient.supplier || "—"}
                    </TableCell>
                    <TableCell className="text-right ">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-primary hover:bg-primary/10"
                          onClick={() =>
                            navigate(
                              `/dashboard/ingredients/${ingredient.id}/edit`
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            deleteConfirm === ingredient.id
                              ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                          }
                          onClick={() => handleDelete(ingredient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
