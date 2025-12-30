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
import { useSalesStore } from "~/stores/salesStore";
import { useRecipeStore } from "~/stores/recipeStore";

export default function NewSale() {
  const navigate = useNavigate();
  const { addSale } = useSalesStore();
  const { recipes } = useRecipeStore();

  const [formData, setFormData] = useState({
    recipeId: "",
    quantitySold: 1,
    dateSold: new Date().toISOString().split("T")[0],
  });

  // Mock recipes for UI display
  const mockRecipes = [
    {
      id: "1",
      name: "Chicken Adobo",
      sellingPrice: 120,
      costBreakdown: {
        materialCost: 45,
        laborCost: 60,
        overheadAllocation: 6.75,
        totalCost: 111.75,
        sellingPrice: 120,
        grossProfit: 8.25,
        profitMargin: 6.88,
      },
    },
    {
      id: "2",
      name: "Sinigang na Baboy",
      sellingPrice: 150,
      costBreakdown: {
        materialCost: 55,
        laborCost: 80,
        overheadAllocation: 8.25,
        totalCost: 143.25,
        sellingPrice: 150,
        grossProfit: 6.75,
        profitMargin: 4.5,
      },
    },
    {
      id: "3",
      name: "Kare-Kare",
      sellingPrice: 200,
      costBreakdown: {
        materialCost: 85,
        laborCost: 120,
        overheadAllocation: 12.75,
        totalCost: 217.75,
        sellingPrice: 200,
        grossProfit: -17.75,
        profitMargin: -8.88,
      },
    },
  ];

  const displayRecipes = recipes.length > 0 ? recipes : mockRecipes;

  const selectedRecipe = displayRecipes.find((r) => r.id === formData.recipeId);
  const unitPrice = selectedRecipe?.sellingPrice || 0;
  const totalAmount = unitPrice * formData.quantitySold;

  // Cost calculations based on selected recipe
  const unitCost = selectedRecipe?.costBreakdown?.totalCost || 0;
  const totalCost = unitCost * formData.quantitySold;
  const totalProfit = totalAmount - totalCost;
  const profitMargin = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipeId) {
      alert("Please select a recipe");
      return;
    }

    if (formData.quantitySold <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    // TODO: Replace with API call
    await addSale({
      businessId: "1", // Will come from auth context
      recipeId: formData.recipeId,
      quantitySold: formData.quantitySold,
      unitPrice: unitPrice,
      totalAmount: totalAmount,
      dateSold: new Date(formData.dateSold),
    });

    navigate("/dashboard/sales");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/sales">
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
          <h1 className="text-3xl font-bold tracking-tight">Record Sale</h1>
          <p className="text-muted-foreground">
            Record a new sales transaction
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sale Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
                <CardDescription>
                  Select the recipe sold and quantity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe">Recipe</Label>
                  <select
                    id="recipe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.recipeId}
                    onChange={(e) =>
                      setFormData({ ...formData, recipeId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a recipe...</option>
                    {displayRecipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name} - {formatCurrency(recipe.sellingPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Sold</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantitySold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantitySold: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date of Sale</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.dateSold}
                      onChange={(e) =>
                        setFormData({ ...formData, dateSold: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Quick quantity buttons */}
                {formData.recipeId && (
                  <div className="space-y-2">
                    <Label>Quick Select Quantity</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 5, 10, 15, 20, 25, 50].map((qty) => (
                        <Button
                          key={qty}
                          type="button"
                          variant={
                            formData.quantitySold === qty
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setFormData({ ...formData, quantitySold: qty })
                          }
                        >
                          {qty}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sale Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Sale Summary</CardTitle>
                <CardDescription>Transaction breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.recipeId ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recipe</span>
                        <span className="font-medium">
                          {selectedRecipe?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Unit Price
                        </span>
                        <span>{formatCurrency(unitPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>× {formData.quantitySold}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total Revenue</span>
                          <span>{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Profit Analysis
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unit Cost</span>
                        <span>{formatCurrency(unitCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Cost
                        </span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Expected Profit</span>
                        <span
                          className={
                            totalProfit >= 0
                              ? "text-secondary"
                              : "text-destructive"
                          }
                        >
                          {formatCurrency(totalProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Profit Margin</span>
                        <span
                          className={
                            profitMargin >= 0
                              ? "text-secondary"
                              : "text-destructive"
                          }
                        >
                          {profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Profit indicator */}
                    <div className="pt-4">
                      {totalProfit < 0 ? (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span className="font-medium text-sm">
                              Warning: Selling at a loss
                            </span>
                          </div>
                          <p className="text-xs text-destructive/80 mt-1">
                            Consider adjusting the selling price or reducing
                            costs.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-secondary">
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
                            <span className="font-medium text-sm">
                              Profitable sale
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-12 w-12"
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
                    <p className="mt-4">Select a recipe to see the summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.recipeId}
              >
                Record Sale
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/sales">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
