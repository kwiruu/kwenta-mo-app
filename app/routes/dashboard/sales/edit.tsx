import { Link, useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { useSale, useUpdateSale, useDeleteSale, useRecipes } from '~/hooks';
import type { SaleCategory } from '~/lib/api';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const saleCategoryLabels: Record<SaleCategory, string> = {
  FOOD: 'Food',
  BEVERAGE: 'Beverage',
  CATERING: 'Catering',
  DELIVERY: 'Delivery',
};

export default function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sale, isLoading: isLoadingSale } = useSale(id!);
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();
  const { data: recipes = [] } = useRecipes();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    recipeId: '',
    quantitySold: 1,
    dateSold: new Date().toISOString().split('T')[0],
    category: 'FOOD' as SaleCategory,
    notes: '',
  });

  // Load sale data
  useEffect(() => {
    if (sale) {
      setFormData({
        recipeId: sale.recipeId,
        quantitySold: sale.quantity,
        dateSold: new Date(sale.saleDate).toISOString().split('T')[0],
        category: sale.category || 'FOOD',
        notes: sale.notes || '',
      });
    }
  }, [sale]);

  const selectedRecipe = recipes.find((r) => r.id === formData.recipeId);
  const unitPrice = selectedRecipe ? Number(selectedRecipe.sellingPrice) : 0;
  const totalAmount = unitPrice * formData.quantitySold;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipeId) {
      alert('Please select a recipe');
      return;
    }

    if (formData.quantitySold <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    updateSaleMutation.mutate(
      {
        id: id!,
        data: {
          recipeId: formData.recipeId,
          quantity: formData.quantitySold,
          unitPrice: unitPrice,
          saleDate: formData.dateSold,
          category: formData.category,
          notes: formData.notes || undefined,
        },
      },
      {
        onSuccess: () => navigate('/dashboard/sales'),
        onError: (error) => console.error('Error updating sale:', error),
      }
    );
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteSaleMutation.mutate(id!, {
        onSuccess: () => navigate('/dashboard/sales'),
        onError: (error) => console.error('Error deleting sale:', error),
      });
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  // Show loading state
  if (isLoadingSale) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto">
            <DotLottieReact src="/assets/loading.lottie" loop autoplay />
          </div>
          <p className="mt-4 text-gray-500">Loading sale...</p>
        </div>
      </div>
    );
  }

  // Show not found
  if (!sale) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border shadow-none bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sale Not Found</h2>
            <p className="text-gray-500 mb-4">
              The sale record you're looking for doesn't exist or has been deleted.
            </p>
            <Button variant="green" asChild>
              <Link to="/dashboard/sales">Go to Sales</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/sales">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Sale</h1>
          <p className="text-muted-foreground">Update sales transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sale Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
                <CardDescription>Update the recipe sold and quantity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe">Recipe</Label>
                  <select
                    id="recipe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.recipeId}
                    onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
                    required
                  >
                    <option value="">Select a recipe...</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name} - {formatCurrency(Number(recipe.sellingPrice))}
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
                      onChange={(e) => setFormData({ ...formData, dateSold: e.target.value })}
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
                    {Object.entries(saleCategoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Categorize this sale for revenue breakdown reports
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this sale..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">×{formData.quantitySold}</span>
                </div>
                <div className="flex justify-between py-2 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                variant="green"
                className="w-full"
                disabled={updateSaleMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateSaleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant={showDeleteConfirm ? 'destructive' : 'outline'}
                className="w-full"
                onClick={handleDelete}
                disabled={deleteSaleMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {showDeleteConfirm
                  ? 'Click again to confirm'
                  : deleteSaleMutation.isPending
                    ? 'Deleting...'
                    : 'Delete Sale'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
