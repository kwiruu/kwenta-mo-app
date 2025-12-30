import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Package, Save } from "lucide-react";
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
import { useIngredientStore } from "~/stores/ingredientStore";
import { APP_CONFIG } from "~/config/app";
import type { IngredientUnit } from "~/types";

export function meta() {
  return [
    { title: `Add Ingredient - ${APP_CONFIG.name}` },
    { name: "description", content: "Add a new ingredient to your inventory" },
  ];
}

const ingredientUnits: {
  value: IngredientUnit;
  label: string;
  examples: string;
}[] = [
  { value: "kg", label: "Kilogram (kg)", examples: "rice, flour, meat" },
  { value: "g", label: "Gram (g)", examples: "spices, seasonings" },
  { value: "L", label: "Liter (L)", examples: "oil, soy sauce" },
  { value: "mL", label: "Milliliter (mL)", examples: "vanilla extract" },
  { value: "pcs", label: "Pieces (pcs)", examples: "eggs, onions" },
  { value: "pack", label: "Pack", examples: "noodles, biscuits" },
  { value: "bottle", label: "Bottle", examples: "vinegar, ketchup" },
  { value: "can", label: "Can", examples: "sardines, corned beef" },
  { value: "bundle", label: "Bundle", examples: "kangkong, pechay" },
];

export default function NewIngredientPage() {
  const navigate = useNavigate();
  const { addIngredient } = useIngredientStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    unit: "" as IngredientUnit,
    pricePerUnit: "",
    currentStock: "",
    reorderLevel: "",
    supplier: "",
  });

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

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      addIngredient({
        name: formData.name.trim(),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        currentStock: parseFloat(formData.currentStock),
        reorderLevel: parseFloat(formData.reorderLevel),
        supplier: formData.supplier.trim() || undefined,
      });

      navigate("/dashboard/ingredients");
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add Ingredient</h1>
        <p className="text-gray-500 mt-1">
          Add a new ingredient to your inventory
        </p>
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
              Enter the details for your ingredient
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
                        <span>{unit.label}</span>
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
                <p className="text-xs text-gray-400">
                  How much do you currently have?
                </p>
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
                <p className="text-xs text-gray-400">
                  You'll be alerted when stock falls below this
                </p>
              </div>
            </div>

            {/* Supplier (Optional) */}
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
              <p className="text-xs text-gray-400">
                Where do you usually buy this ingredient?
              </p>
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
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Ingredient
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
