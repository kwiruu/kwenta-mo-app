import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  MapPin,
  Users,
  DollarSign,
  Package,
  Save,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
import { useBusinessStore } from "~/stores/businessStore";
import { APP_CONFIG } from "~/config/app";
import type { BusinessType } from "~/types";

export function meta() {
  return [
    { title: `Business Profile - ${APP_CONFIG.name}` },
    { name: "description", content: "Set up your business profile" },
  ];
}

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "carinderia", label: "Carinderia" },
  { value: "food_stall", label: "Food Stall" },
  { value: "restaurant", label: "Restaurant" },
  { value: "catering", label: "Catering" },
  { value: "bakery", label: "Bakery" },
  { value: "other", label: "Other" },
];

const rawMaterialSources = [
  { value: "market", label: "Local Market (Palengke)" },
  { value: "supplier", label: "Direct Supplier" },
  { value: "own_farm", label: "Own Farm/Garden" },
  { value: "mixed", label: "Mixed Sources" },
];

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const { currentBusiness, setCurrentBusiness } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: currentBusiness?.name || "",
    type: currentBusiness?.type || ("" as BusinessType),
    location: currentBusiness?.location || "",
    employeeCount: currentBusiness?.employeeCount?.toString() || "",
    avgMonthlySales: currentBusiness?.avgMonthlySales?.toString() || "",
    rawMaterialSource: currentBusiness?.rawMaterialSource || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const businessData = {
        id: currentBusiness?.id || crypto.randomUUID(),
        name: formData.name,
        type: formData.type as BusinessType,
        location: formData.location,
        employeeCount: parseInt(formData.employeeCount) || 0,
        avgMonthlySales: parseFloat(formData.avgMonthlySales) || 0,
        rawMaterialSource: formData.rawMaterialSource,
        createdAt: currentBusiness?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      setCurrentBusiness(businessData);
      setSuccess(true);

      // If first time setup, redirect to dashboard
      if (!currentBusiness) {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.error("Error saving business profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Business Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Set up your business information for accurate costing calculations.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
          <p className="text-secondary font-medium">
            ✓ Business profile saved successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              Basic Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Tell us about your food business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Business Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Lola's Carinderia"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-gray-200 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700">
                Business Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as BusinessType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="flex items-center gap-2 text-gray-700"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Business Location *
              </Label>
              <Textarea
                id="location"
                placeholder="e.g., Barangay Lahug, Cebu City"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="border-gray-200 focus:border-primary focus:ring-primary"
                required
              />
              <p className="text-xs text-gray-400">
                Enter your complete business address in Cebu City
              </p>
            </div>

            {/* Employee Count */}
            <div className="space-y-2">
              <Label
                htmlFor="employeeCount"
                className="flex items-center gap-2 text-gray-700"
              >
                <Users className="h-4 w-4 text-primary" />
                Number of Employees *
              </Label>
              <Input
                id="employeeCount"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCount: e.target.value })
                }
                className="border-gray-200 focus:border-primary focus:ring-primary"
                required
              />
              <p className="text-xs text-gray-400">
                Include yourself if you work in the business
              </p>
            </div>

            {/* Average Monthly Sales */}
            <div className="space-y-2">
              <Label
                htmlFor="avgMonthlySales"
                className="flex items-center gap-2 text-gray-700"
              >
                <DollarSign className="h-4 w-4 text-primary" />
                Average Monthly Sales (₱) *
              </Label>
              <Input
                id="avgMonthlySales"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 50000"
                value={formData.avgMonthlySales}
                onChange={(e) =>
                  setFormData({ ...formData, avgMonthlySales: e.target.value })
                }
                className="border-gray-200 focus:border-primary focus:ring-primary"
                required
              />
              <p className="text-xs text-gray-400">
                Estimate based on your typical monthly revenue
              </p>
            </div>

            {/* Source of Raw Materials */}
            <div className="space-y-2">
              <Label
                htmlFor="rawMaterialSource"
                className="flex items-center gap-2 text-gray-700"
              >
                <Package className="h-4 w-4 text-primary" />
                Source of Raw Materials *
              </Label>
              <Select
                value={formData.rawMaterialSource}
                onValueChange={(value) =>
                  setFormData({ ...formData, rawMaterialSource: value })
                }
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Where do you get your ingredients?" />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterialSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Business Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
