import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useRecipeStore } from "~/stores/recipeStore";
import { useIngredientStore } from "~/stores/ingredientStore";
import { useState } from "react";

export default function RecipesIndex() {
  const { recipes, deleteRecipe, calculateCost } = useRecipeStore();
  const { ingredients } = useIngredientStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(id);
    }
  };

  // Mock data for UI display
  const mockRecipes = [
    {
      id: "1",
      businessId: "1",
      name: "Chicken Adobo",
      sellingPrice: 120,
      prepTimeMinutes: 45,
      laborRatePerHour: 80,
      isActive: true,
      ingredients: [],
      costBreakdown: {
        materialCost: 45,
        laborCost: 60,
        overheadAllocation: 6.75,
        totalCost: 111.75,
        sellingPrice: 120,
        grossProfit: 8.25,
        profitMargin: 6.88,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      businessId: "1",
      name: "Sinigang na Baboy",
      sellingPrice: 150,
      prepTimeMinutes: 60,
      laborRatePerHour: 80,
      isActive: true,
      ingredients: [],
      costBreakdown: {
        materialCost: 55,
        laborCost: 80,
        overheadAllocation: 8.25,
        totalCost: 143.25,
        sellingPrice: 150,
        grossProfit: 6.75,
        profitMargin: 4.5,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      businessId: "1",
      name: "Kare-Kare",
      sellingPrice: 200,
      prepTimeMinutes: 90,
      laborRatePerHour: 80,
      isActive: false,
      ingredients: [],
      costBreakdown: {
        materialCost: 85,
        laborCost: 120,
        overheadAllocation: 12.75,
        totalCost: 217.75,
        sellingPrice: 200,
        grossProfit: -17.75,
        profitMargin: -8.88,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const displayRecipes = recipes.length > 0 ? filteredRecipes : mockRecipes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">
            Manage your recipes and view cost breakdowns
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/recipes/new">
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
            Add Recipe
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
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
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{displayRecipes.length}</div>
            <p className="text-xs text-muted-foreground">Total Recipes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {displayRecipes.filter((r) => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Recipes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary">
              {
                displayRecipes.filter(
                  (r) => r.costBreakdown && r.costBreakdown.profitMargin > 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Profitable</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {
                displayRecipes.filter(
                  (r) => r.costBreakdown && r.costBreakdown.profitMargin < 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Needs Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayRecipes.map((recipe) => {
          const cost = recipe.costBreakdown;
          const isProfitable = cost && cost.profitMargin > 0;

          return (
            <Card key={recipe.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <CardDescription>
                      Prep time: {recipe.prepTimeMinutes} mins
                    </CardDescription>
                  </div>
                  <Badge variant={recipe.isActive ? "default" : "secondary"}>
                    {recipe.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Selling Price</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(recipe.sellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="font-semibold text-lg">
                      {cost ? formatCurrency(cost.totalCost) : "—"}
                    </p>
                  </div>
                </div>

                {/* Profit Info */}
                {cost && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Gross Profit
                      </span>
                      <span
                        className={`font-semibold ${
                          isProfitable ? "text-secondary" : "text-destructive"
                        }`}
                      >
                        {formatCurrency(cost.grossProfit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">
                        Profit Margin
                      </span>
                      <span
                        className={`font-semibold ${
                          isProfitable ? "text-secondary" : "text-destructive"
                        }`}
                      >
                        {cost.profitMargin.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown Mini */}
                {cost && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials</span>
                      <span>{formatCurrency(cost.materialCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor</span>
                      <span>{formatCurrency(cost.laborCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overhead</span>
                      <span>{formatCurrency(cost.overheadAllocation)}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/dashboard/recipes/edit?id=${recipe.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(recipe.id)}
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayRecipes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">No recipes yet</h3>
            <p className="mt-2 text-muted-foreground">
              Get started by creating your first recipe to calculate costs and
              track profitability.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/dashboard/recipes/new">Create Recipe</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
