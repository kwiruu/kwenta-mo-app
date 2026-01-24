import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { NumberInput } from '~/components/ui/number-input';
import { useCreateRecipe, usePurchases, useActivePeriod, useUserProfile } from '~/hooks';

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
  const { data: activePeriod } = useActivePeriod();
  const { data: purchases = [] } = usePurchases({
    periodId: activePeriod?.id,
  });
  const { data: profile } = useUserProfile();
  const business = profile?.business;

  const [formData, setFormData] = useState({
    name: '',
    batchSellingPrice: '', // Total selling price for the entire batch
    prepTimeMinutes: '',
    laborRatePerHour: '',
    isActive: true,
    yield: '', // Number of servings this recipe produces
  });
  const [profitMarginInput, setProfitMarginInput] = useState<string>('');
  const [costViewTab, setCostViewTab] = useState<'batch' | 'serving'>('batch');

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientInput[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState(1);

  // Group purchased items by item name and calculate average cost
  const displayIngredients = purchases.reduce(
    (acc, purchase) => {
      const itemName = purchase.name || 'Unknown';
      const existing = acc.find((item) => item.name === itemName);
      if (existing) {
        // Average the costs if multiple purchases of same item
        const totalQty = existing.totalQuantity + Number(purchase.quantity);
        existing.pricePerUnit =
          (existing.pricePerUnit * existing.totalQuantity +
            Number(purchase.unitCost) * Number(purchase.quantity)) /
          totalQty;
        existing.totalQuantity = totalQty;
      } else {
        acc.push({
          id: purchase.id,
          name: itemName,
          pricePerUnit: Number(purchase.unitCost),
          unit: purchase.unit || 'unit',
          totalQuantity: Number(purchase.quantity),
        });
      }
      return acc;
    },
    [] as Array<{
      id: string;
      name: string;
      pricePerUnit: number;
      unit: string;
      totalQuantity: number;
    }>
  );

  const addIngredient = () => {
    if (!selectedIngredientId || ingredientQuantity <= 0) return;

    const ingredient = displayIngredients.find((i) => i.id === selectedIngredientId);
    if (!ingredient) return;

    // Check if already added
    if (recipeIngredients.some((ri) => ri.ingredientId === selectedIngredientId)) {
      alert('This ingredient is already added. Edit the quantity instead.');
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

    setSelectedIngredientId('');
    setIngredientQuantity(1);
  };

  const removeIngredient = (ingredientId: string) => {
    setRecipeIngredients(recipeIngredients.filter((ri) => ri.ingredientId !== ingredientId));
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

  // Batch Cost calculations
  const overheadRate = business?.overheadRate ?? 0.15;
  const batchMaterialCost = recipeIngredients.reduce((sum, ri) => sum + ri.totalCost, 0);
  const batchLaborCost = (formData.prepTimeMinutes / 60) * formData.laborRatePerHour;
  const batchOverhead = batchMaterialCost * overheadRate;
  const batchTotalCost = batchMaterialCost + batchLaborCost + batchOverhead;

  // Per-Unit Cost calculations (divided by yield)
  const recipeYield = formData.yield || 1;
  const materialCostPerUnit = batchMaterialCost / recipeYield;
  const laborCostPerUnit = batchLaborCost / recipeYield;
  const overheadPerUnit = batchOverhead / recipeYield;
  const totalCostPerUnit = batchTotalCost / recipeYield;

  // Calculate per-serving price from batch price
  const sellingPricePerServing = formData.batchSellingPrice / recipeYield;

  // Profit calculations (per unit)
  const grossProfit = sellingPricePerServing - totalCostPerUnit;
  const profitMargin =
    sellingPricePerServing > 0 ? (grossProfit / sellingPricePerServing) * 100 : 0;

  // Keep legacy name for material cost display in ingredients table
  const materialCost = batchMaterialCost;
  const totalCost = totalCostPerUnit; // Now represents per-unit cost

  // Handle selling price change - update profit margin input
  const handleSellingPriceChange = (value: number) => {
    setFormData({ ...formData, batchSellingPrice: value });
    const perServingPrice = value / recipeYield;
    if (totalCost > 0 && perServingPrice > 0) {
      const margin = ((perServingPrice - totalCost) / perServingPrice) * 100;
      setProfitMarginInput(margin.toFixed(2));
    } else {
      setProfitMarginInput('');
    }
  };

  // Handle profit margin change - calculate and update selling price
  const handleProfitMarginChange = (marginPercent: string) => {
    setProfitMarginInput(marginPercent);
    const margin = parseFloat(marginPercent);
    if (!isNaN(margin) && totalCost > 0 && margin < 100) {
      // Formula: sellingPrice = totalCost / (1 - margin/100)
      const calculatedPricePerServing = totalCost / (1 - margin / 100);
      const batchPrice = calculatedPricePerServing * recipeYield;
      setFormData({ ...formData, batchSellingPrice: Math.round(batchPrice * 100) / 100 });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter a recipe name');
      return;
    }

    if (recipeIngredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    createRecipeMutation.mutate(
      {
        name: formData.name,
        sellingPrice: sellingPricePerServing, // Send per-serving price to API
        preparationTime: formData.prepTimeMinutes,
        servings: formData.yield,
        ingredients: recipeIngredients.map((ri) => ({
          ingredientId: ri.ingredientId,
          quantity: ri.quantityRequired,
        })),
      },
      {
        onSuccess: () => navigate('/dashboard/recipes'),
        onError: (error) => console.error('Error adding recipe:', error),
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
          <p className="text-muted-foreground">Create a new recipe and calculate its costs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recipe Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
                <CardDescription>Basic information about your recipe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Chicken Adobo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yield">Yield (servings)</Label>
                    <NumberInput
                      id="yield"
                      value={formData.yield}
                      onChange={(value) => setFormData({ ...formData, yield: Math.max(1, value) })}
                      placeholder="e.g., 10"
                      min={1}
                      allowDecimal={false}
                    />
                    <p className="text-xs text-muted-foreground">
                      How many servings does this recipe make?
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="batchSellingPrice">Batch Selling Price (₱)</Label>
                    <NumberInput
                      id="batchSellingPrice"
                      value={formData.batchSellingPrice}
                      onChange={handleSellingPriceChange}
                      placeholder="0.00"
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total price for {recipeYield} servings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perServingPrice">Per Serving Selling Price (₱)</Label>
                    <NumberInput
                      id="perServingPrice"
                      value={sellingPricePerServing}
                      onChange={(value) => {
                        const newBatchPrice = value * recipeYield;
                        setFormData({ ...formData, batchSellingPrice: newBatchPrice });
                        if (totalCost > 0 && value > 0) {
                          const margin = ((value - totalCost) / value) * 100;
                          setProfitMarginInput(margin.toFixed(2));
                        } else {
                          setProfitMarginInput('');
                        }
                      }}
                      placeholder="0.00"
                      min={0}
                      disabled={recipeYield < 1}
                      maxDecimals={2}
                    />
                    <p className="text-xs text-muted-foreground">Price per individual serving</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      min="0"
                      max="99"
                      step="0.01"
                      placeholder="e.g., 30 or 25.5"
                      value={profitMarginInput}
                      onChange={(e) => handleProfitMarginChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set desired margin to auto-calculate price
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="0"
                      value={formData.prepTimeMinutes || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prepTimeMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laborRate">Labor Rate (₱/hour)</Label>
                    <NumberInput
                      id="laborRate"
                      value={formData.laborRatePerHour}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          laborRatePerHour: value,
                        })
                      }
                      placeholder="80.00"
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>Add ingredients and their quantities</CardDescription>
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
                          {ing.name} ({formatCurrency(ing.pricePerUnit)}/{ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={ingredientQuantity || ''}
                      onChange={(e) => setIngredientQuantity(parseFloat(e.target.value) || 0)}
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
                          <th className="text-left p-3 font-medium">Ingredient</th>
                          <th className="text-center p-3 font-medium">Qty</th>
                          <th className="text-right p-3 font-medium">Unit Cost</th>
                          <th className="text-right p-3 font-medium">Total</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipeIngredients.map((ri) => (
                          <tr key={ri.ingredientId} className="border-t">
                            <td className="p-3">{ri.ingredientName}</td>
                            <td className="p-3 text-center">
                              <NumberInput
                                className="w-20 mx-auto text-center"
                                value={ri.quantityRequired}
                                onChange={(value) =>
                                  updateIngredientQuantity(ri.ingredientId, value)
                                }
                                min={0}
                                allowDecimal={false}
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
                                onClick={() => removeIngredient(ri.ingredientId)}
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
                    <p className="text-sm">Add ingredients to calculate costs.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Recipe Economics</CardTitle>
                <CardDescription>Cost and profit breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tab Selector */}
                <div className="flex gap-2 border-b">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      costViewTab === 'batch'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setCostViewTab('batch')}
                  >
                    Per Batch ({recipeYield})
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      costViewTab === 'serving'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setCostViewTab('serving')}
                  >
                    Per Serving
                  </button>
                </div>

                {/* Batch View */}
                {costViewTab === 'batch' && (
                  <>
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        Batch Cost Breakdown
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Material Cost</span>
                        <span>{formatCurrency(batchMaterialCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Labor Cost</span>
                        <span>{formatCurrency(batchLaborCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Overhead ({(overheadRate * 100).toFixed(0)}%)
                        </span>
                        <span>{formatCurrency(batchOverhead)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total Batch Cost</span>
                          <span>{formatCurrency(batchTotalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch Selling Price</span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(formData.batchSellingPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Batch Profit</span>
                        <span
                          className={
                            formData.batchSellingPrice - batchTotalCost >= 0
                              ? 'text-lightgreenz'
                              : 'text-destructive'
                          }
                        >
                          {formatCurrency(formData.batchSellingPrice - batchTotalCost)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Profit Margin</span>
                        <span
                          className={profitMargin >= 0 ? 'text-lightgreenz' : 'text-destructive'}
                        >
                          {profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Per Serving View */}
                {costViewTab === 'serving' && (
                  <>
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        Per Serving Breakdown
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Material Cost</span>
                        <span>{formatCurrency(materialCostPerUnit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Labor Cost</span>
                        <span>{formatCurrency(laborCostPerUnit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Overhead ({(overheadRate * 100).toFixed(0)}%)
                        </span>
                        <span>{formatCurrency(overheadPerUnit)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Cost per Serving</span>
                          <span>{formatCurrency(totalCostPerUnit)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selling Price per Serving</span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(sellingPricePerServing)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Profit per Serving</span>
                        <span
                          className={grossProfit >= 0 ? 'text-lightgreenz' : 'text-destructive'}
                        >
                          {formatCurrency(grossProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Profit Margin</span>
                        <span
                          className={profitMargin >= 0 ? 'text-lightgreenz' : 'text-destructive'}
                        >
                          {profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Margin Indicator */}
                    <div className="pt-4">
                      <div className="text-sm text-muted-foreground mb-2">Margin Status</div>
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                variant="green"
                disabled={createRecipeMutation.isPending}
              >
                {createRecipeMutation.isPending ? (
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
                    Saving...
                  </>
                ) : (
                  'Save Recipe'
                )}
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
