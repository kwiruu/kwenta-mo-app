import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Package, Save, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  useIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { IngredientUnit } from "~/types";

export function meta() {
  return [
    { title: `Edit Ingredient - ${APP_CONFIG.name}` },
    { name: "description", content: "Edit ingredient details" },
  ];
}

const ingredientUnits: { value: IngredientUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "L", label: "Liter (L)" },
  { value: "mL", label: "Milliliter (mL)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "pack", label: "Pack" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "bundle", label: "Bundle" },
];

export default function EditIngredientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: ingredient, isLoading: isLoadingIngredient } = useIngredient(
    id!
  );
  const updateIngredientMutation = useUpdateIngredient();
  const deleteIngredientMutation = useDeleteIngredient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    unit: "" as IngredientUnit,
    pricePerUnit: "",
    currentStock: "",
    reorderLevel: "",
    supplier: "",
  });

  // Load ingredient data when it's fetched
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        unit: ingredient.unit as IngredientUnit,
        pricePerUnit: ingredient.costPerUnit.toString(),
        currentStock: ingredient.currentStock.toString(),
        reorderLevel: ingredient.reorderLevel.toString(),
        supplier: ingredient.supplier || "",
      });
    }
  }, [ingredient]);

  // Show loading state
  if (isLoadingIngredient) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greenz mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading ingredient...</p>
        </div>
      </div>
    );
  }

  // Redirect if ingredient not found
  if (!ingredient) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border shadow-none bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ingredient Not Found
            </h2>
            <p className="text-gray-500 mb-4">
              The ingredient you're looking for doesn't exist or has been
              deleted.
            </p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/dashboard/ingredients">Go to Ingredients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ingredient name is required";
    }
    if (!formData.unit) {
      newErrors.unit = "Please select a unit";
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = "Enter a valid price";
    }
    if (!formData.currentStock || parseFloat(formData.currentStock) < 0) {
      newErrors.currentStock = "Enter current stock amount";
    }
    if (!formData.reorderLevel || parseFloat(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = "Enter reorder level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    updateIngredientMutation.mutate(
      {
        id: id!,
        data: {
          name: formData.name.trim(),
          unit: formData.unit,
          costPerUnit: parseFloat(formData.pricePerUnit),
          currentStock: parseFloat(formData.currentStock),
          reorderLevel: parseFloat(formData.reorderLevel),
          supplier: formData.supplier.trim() || undefined,
        },
      },
      {
        onSuccess: () => navigate("/dashboard/ingredients"),
        onError: (error) => console.error("Error updating ingredient:", error),
      }
    );
  };

  const handleDelete = async () => {
    deleteIngredientMutation.mutate(id!, {
      onSuccess: () => navigate("/dashboard/ingredients"),
      onError: (error) => console.error("Error deleting ingredient:", error),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        asChild
        className="-ml-2 text-gray-600 hover:text-gray-900"
      >
        <Link to="/dashboard/ingredients">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ingredients
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Ingredient
          </h1>
          <p className="text-gray-500 mt-1">
            Update the details for {ingredient.name}
          </p>
        </div>
        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-gray-200"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Ingredient Details
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update the details for your ingredient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ingredient Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Ingredient Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Rice, Pork Belly, Cooking Oil"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={errors.name ? "border-red-300" : "border-gray-200"}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Unit and Price Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-gray-700">
                  Unit of Measurement *
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value as IngredientUnit })
                  }
                >
                  <SelectTrigger
                    className={
                      errors.unit ? "border-red-300" : "border-gray-200"
                    }
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit}</p>
                )}
              </div>

              {/* Price Per Unit */}
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="text-gray-700">
                  Price Per Unit (₱) *
                </Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 55.00"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  className={
                    errors.pricePerUnit ? "border-red-300" : "border-gray-200"
                  }
                />
                {errors.pricePerUnit && (
                  <p className="text-sm text-red-500">{errors.pricePerUnit}</p>
                )}
              </div>
            </div>

            {/* Stock Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Current Stock */}
              <div className="space-y-2">
                <Label htmlFor="currentStock" className="text-gray-700">
                  Current Stock *
                </Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 10"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                  className={
                    errors.currentStock ? "border-red-300" : "border-gray-200"
                  }
                />
                {errors.currentStock && (
                  <p className="text-sm text-red-500">{errors.currentStock}</p>
                )}
              </div>

              {/* Reorder Level */}
              <div className="space-y-2">
                <Label htmlFor="reorderLevel" className="text-gray-700">
                  Reorder Level *
                </Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
                  }
                  className={
                    errors.reorderLevel ? "border-red-300" : "border-gray-200"
                  }
                />
                {errors.reorderLevel && (
                  <p className="text-sm text-red-500">{errors.reorderLevel}</p>
                )}
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-gray-700">
                Supplier (Optional)
              </Label>
              <Input
                id="supplier"
                placeholder="e.g., Carbon Market, Supplier Name"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="border-gray-200 text-gray-700"
            asChild
          >
            <Link to="/dashboard/ingredients">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={updateIngredientMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {updateIngredientMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
