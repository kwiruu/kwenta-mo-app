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
import { useCreateSale, useRecipes } from "~/hooks";
import type { SaleCategory } from "~/lib/api";

const saleCategoryLabels: Record<SaleCategory, string> = {
  FOOD: "Food",
  BEVERAGE: "Beverage",
  CATERING: "Catering",
  DELIVERY: "Delivery",
};

export default function NewSale() {
  const navigate = useNavigate();
  const createSaleMutation = useCreateSale();
  const { data: recipes = [] } = useRecipes();

  const [formData, setFormData] = useState({
    recipeId: "",
    quantitySold: 1,
    dateSold: new Date().toISOString().split("T")[0],
    category: "FOOD" as SaleCategory,
  });

  const selectedRecipe = recipes.find((r) => r.id === formData.recipeId);
  const unitPrice = selectedRecipe?.sellingPrice || 0;
  const totalAmount = unitPrice * formData.quantitySold;

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

    createSaleMutation.mutate(
      {
        recipeId: formData.recipeId,
        quantity: formData.quantitySold,
        unitPrice: unitPrice,
        saleDate: formData.dateSold,
        category: formData.category,
      },
      {
        onSuccess: () => navigate("/dashboard/sales"),
        onError: (error) => console.error("Error adding sale:", error),
      }
    );
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
                    {recipes.map((recipe) => (
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

                <div className="space-y-2">
                  <Label htmlFor="category">Sale Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as SaleCategory,
                      })
                    }
                    required
                  >
                    {Object.entries(saleCategoryLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Categorize this sale for revenue breakdown reports
                  </p>
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
                disabled={!formData.recipeId || createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Recording...
                  </>
                ) : (
                  "Record Sale"
                )}
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
