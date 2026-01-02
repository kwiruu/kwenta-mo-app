import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCreateRecipe, useIngredients } from "~/hooks";

interface RecipeIngredientInput {
  ingredientId: string;
  ingredientName: string;
  quantityRequired: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export default function NewRecipe() {
  const navigate = useNavigate();
  const createRecipeMutation = useCreateRecipe();
  const { data: ingredients = [] } = useIngredients();

  const [formData, setFormData] = useState({
    name: "",
    sellingPrice: 0,
    prepTimeMinutes: 0,
    laborRatePerHour: 80,
    isActive: true,
  });

  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredientInput[]
  >([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState(0);

  // Use ingredients from API, map to display format
  const displayIngredients = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    pricePerUnit: i.costPerUnit,
    unit: i.unit,
  }));

  const addIngredient = () => {
    if (!selectedIngredientId || ingredientQuantity <= 0) return;

    const ingredient = displayIngredients.find(
      (i) => i.id === selectedIngredientId
    );
    if (!ingredient) return;

    // Check if already added
    if (
      recipeIngredients.some((ri) => ri.ingredientId === selectedIngredientId)
    ) {
      alert("This ingredient is already added. Edit the quantity instead.");
      return;
    }

    const totalCost = ingredient.pricePerUnit * ingredientQuantity;
    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantityRequired: ingredientQuantity,
        unit: ingredient.unit,
        unitCost: ingredient.pricePerUnit,
        totalCost,
      },
    ]);

    setSelectedIngredientId("");
    setIngredientQuantity(0);
  };

  const removeIngredient = (ingredientId: string) => {
    setRecipeIngredients(
      recipeIngredients.filter((ri) => ri.ingredientId !== ingredientId)
    );
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    setRecipeIngredients(
      recipeIngredients.map((ri) =>
        ri.ingredientId === ingredientId
          ? {
              ...ri,
              quantityRequired: quantity,
              totalCost: ri.unitCost * quantity,
            }
          : ri
      )
    );
  };

  // Cost calculations (will be done by backend)
  const materialCost = recipeIngredients.reduce(
    (sum, ri) => sum + ri.totalCost,
    0
  );
  const laborCost = (formData.prepTimeMinutes / 60) * formData.laborRatePerHour;
  const overheadAllocation = materialCost * 0.15;
  const totalCost = materialCost + laborCost + overheadAllocation;
  const grossProfit = formData.sellingPrice - totalCost;
  const profitMargin =
    formData.sellingPrice > 0 ? (grossProfit / formData.sellingPrice) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter a recipe name");
      return;
    }

    if (recipeIngredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    createRecipeMutation.mutate(
      {
        name: formData.name,
        sellingPrice: formData.sellingPrice,
        preparationTime: formData.prepTimeMinutes,
        ingredients: recipeIngredients.map((ri) => ({
          ingredientId: ri.ingredientId,
          quantity: ri.quantityRequired,
        })),
      },
      {
        onSuccess: () => navigate("/dashboard/recipes"),
        onError: (error) => console.error("Error adding recipe:", error),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/recipes">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Recipe</h1>
          <p className="text-muted-foreground">
            Create a new recipe and calculate its costs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recipe Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
                <CardDescription>
                  Basic information about your recipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Chicken Adobo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price (₱)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellingPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="0"
                      value={formData.prepTimeMinutes || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prepTimeMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laborRate">Labor Rate (₱/hour)</Label>
                  <Input
                    id="laborRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.laborRatePerHour || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laborRatePerHour: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to calculate labor cost based on prep time
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  Add ingredients and their quantities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Ingredient Form */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Select Ingredient</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                    >
                      <option value="">Choose ingredient...</option>
                      {displayIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({formatCurrency(ing.pricePerUnit)}/
                          {ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ingredientQuantity || ""}
                      onChange={(e) =>
                        setIngredientQuantity(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <Button type="button" onClick={addIngredient} variant="green">
                    Add
                  </Button>
                </div>

                {/* Ingredients List */}
                {recipeIngredients.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">
                            Ingredient
                          </th>
                          <th className="text-center p-3 font-medium">Qty</th>
                          <th className="text-right p-3 font-medium">
                            Unit Cost
                          </th>
                          <th className="text-right p-3 font-medium">Total</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipeIngredients.map((ri) => (
                          <tr key={ri.ingredientId} className="border-t">
                            <td className="p-3">{ri.ingredientName}</td>
                            <td className="p-3 text-center">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-20 mx-auto text-center"
                                value={ri.quantityRequired}
                                onChange={(e) =>
                                  updateIngredientQuantity(
                                    ri.ingredientId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {formatCurrency(ri.unitCost)}/{ri.unit}
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(ri.totalCost)}
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  removeIngredient(ri.ingredientId)
                                }
                                className="text-destructive hover:text-destructive/80"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/50">
                        <tr className="border-t">
                          <td colSpan={3} className="p-3 font-medium">
                            Total Material Cost
                          </td>
                          <td className="p-3 text-right font-bold">
                            {formatCurrency(materialCost)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No ingredients added yet.</p>
                    <p className="text-sm">
                      Add ingredients to calculate costs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Real-time cost calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Material Cost</span>
                    <span>{formatCurrency(materialCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Labor Cost
                      <span className="block text-xs">
                        ({formData.prepTimeMinutes} min ×{" "}
                        {formatCurrency(formData.laborRatePerHour)}/hr)
                      </span>
                    </span>
                    <span>{formatCurrency(laborCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overhead (15%)
                    </span>
                    <span>{formatCurrency(overheadAllocation)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selling Price</span>
                    <span>{formatCurrency(formData.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Gross Profit</span>
                    <span
                      className={
                        grossProfit >= 0
                          ? "text-lightgreenz"
                          : "text-destructive"
                      }
                    >
                      {formatCurrency(grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Profit Margin</span>
                    <span
                      className={
                        profitMargin >= 0
                          ? "text-lightgreenz"
                          : "text-destructive"
                      }
                    >
                      {profitMargin.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Margin Indicator */}
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Margin Status
                  </div>
                  {profitMargin >= 20 ? (
                    <div className="flex items-center gap-2 text-greenz">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">Healthy margin</span>
                    </div>
                  ) : profitMargin >= 0 ? (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="font-medium">Low margin</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">Losing money!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" variant="green">
                Save Recipe
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/recipes">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
