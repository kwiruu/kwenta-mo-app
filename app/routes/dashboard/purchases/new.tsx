import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Truck, Save, Package } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { NumberInput } from '~/components/ui/number-input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useCreatePurchase, usePurchases } from '~/hooks';
import { APP_CONFIG } from '~/config/app';
import type { InventoryType } from '~/lib/api';

export function meta() {
  return [
    { title: `Add Purchase - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Record a new purchase' },
  ];
}

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const createMutation = useCreatePurchase();
  const { data: existingPurchases = [] } = usePurchases({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    itemName: '',
    itemType: 'RAW_MATERIAL' as InventoryType,
    unit: 'unit',
    quantity: '',
    unitCost: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // When existing item is selected, auto-fill details
  const handleExistingItemSelect = (purchaseId: string) => {
    const existingItem = existingPurchases.find((p) => p.id === purchaseId);
    if (existingItem) {
      setFormData({
        ...formData,
        itemName: existingItem.name,
        itemType: existingItem.itemType || 'RAW_MATERIAL',
        unit: existingItem.unit || 'unit',
        unitCost: String(existingItem.unitCost),
        supplier: existingItem.supplier || '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Enter a valid quantity';
    }
    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      newErrors.unitCost = 'Enter a valid unit cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createMutation.mutate(
      {
        itemName: formData.itemName.trim(),
        itemType: formData.itemType,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        supplier: formData.supplier.trim() || undefined,
        purchaseDate: formData.purchaseDate,
        notes: formData.notes.trim() || undefined,
      },
      {
        onSuccess: () => navigate('/dashboard/purchases'),
        onError: (error) => console.error('Error adding purchase:', error),
      }
    );
  };

  const totalCost = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unitCost) || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="-ml-2 text-gray-600 hover:text-gray-900">
        <Link to="/dashboard/purchases">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchases
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add Purchase</h1>
        <p className="text-gray-500 mt-1">Record a new purchase of raw materials or packaging</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-500" />
              </div>
              Purchase Details
            </CardTitle>
            <CardDescription className="text-gray-500">
              Enter the details for your purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Copy from Existing Item (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="existingItem" className="text-gray-700">
                Copy from Existing Item (Optional)
              </Label>
              <Select onValueChange={handleExistingItemSelect}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select an item to auto-fill" />
                </SelectTrigger>
                <SelectContent>
                  {existingPurchases.map((purchase) => (
                    <SelectItem key={purchase.id} value={purchase.id}>
                      {purchase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Selecting an item will auto-fill the details</p>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-gray-700">
                Item Name *
              </Label>
              <Input
                id="itemName"
                placeholder="e.g., Flour, Sugar, Containers"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className={errors.itemName ? 'border-red-300' : 'border-gray-200'}
              />
              {errors.itemName && <p className="text-sm text-red-500">{errors.itemName}</p>}
            </div>

            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType" className="text-gray-700">
                Item Type *
              </Label>
              <Select
                value={formData.itemType}
                onValueChange={(value) =>
                  setFormData({ ...formData, itemType: value as InventoryType })
                }
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAW_MATERIAL">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Raw Material
                    </div>
                  </SelectItem>
                  <SelectItem value="PACKAGING">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Packaging
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Unit Cost */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-700">
                  Quantity *
                </Label>
                <NumberInput
                  id="quantity"
                  placeholder="e.g., 10"
                  value={formData.quantity}
                  onChange={(value) => setFormData({ ...formData, quantity: value.toString() })}
                  className={errors.quantity ? 'border-red-300' : 'border-gray-200'}
                  min={0}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost" className="text-gray-700">
                  Unit Cost (₱) *
                </Label>
                <NumberInput
                  id="unitCost"
                  placeholder="e.g., 50"
                  value={formData.unitCost}
                  onChange={(value) => setFormData({ ...formData, unitCost: value.toString() })}
                  className={errors.unitCost ? 'border-red-300' : 'border-gray-200'}
                  min={0}
                />
                {errors.unitCost && <p className="text-sm text-red-500">{errors.unitCost}</p>}
              </div>
            </div>

            {/* Total Cost Display */}
            {totalCost > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            )}

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-gray-700">
                Supplier
              </Label>
              <Input
                id="supplier"
                placeholder="e.g., ABC Suppliers"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="border-gray-200"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="text-gray-700">
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="border-gray-200"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-gray-200"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/dashboard/purchases')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Purchase
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
