import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Warehouse, Save, Calendar, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useCreateInventoryPeriod } from "~/hooks";
import { APP_CONFIG } from "~/config/app";

export function meta() {
  return [
    { title: `New Inventory Period - ${APP_CONFIG.name}` },
    { name: "description", content: "Create a new inventory period" },
  ];
}

export default function NewInventoryPeriodPage() {
  const navigate = useNavigate();
  const createMutation = useCreateInventoryPeriod();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current month's first and last day as defaults
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [formData, setFormData] = useState({
    name: `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`,
    startDate: firstDayOfMonth.toISOString().split("T")[0],
    endDate: lastDayOfMonth.toISOString().split("T")[0],
    notes: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Period name is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createMutation.mutate(
      {
        periodName: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      {
        onSuccess: (data) => {
          // Navigate to the period detail page
          navigate(`/dashboard/inventory/${data.id}`);
        },
        onError: (error) => console.error("Error creating period:", error),
      }
    );
  };

  // Quick period buttons
  const setQuickPeriod = (months: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFormData({
      ...formData,
      name:
        months === 1
          ? `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`
          : months === 3
            ? `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`
            : `${now.getFullYear()}`,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
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
        <Link to="/dashboard/inventory">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          New Inventory Period
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new period to track beginning and ending inventory
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Warehouse className="h-4 w-4 text-blue-500" />
              </div>
              Period Details
            </CardTitle>
            <CardDescription className="text-gray-500">
              Define the time period for your inventory tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Period Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700">Quick Period Selection</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickPeriod(1)}
                >
                  This Month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickPeriod(3)}
                >
                  This Quarter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickPeriod(12)}
                >
                  This Year
                </Button>
              </div>
            </div>

            {/* Period Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Period Name *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  placeholder="e.g., January 2025, Q1 2025"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`pl-10 ${errors.name ? "border-red-300" : "border-gray-200"}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-gray-700">
                  Start Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={`pl-10 ${errors.startDate ? "border-red-300" : "border-gray-200"}`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-700">
                  End Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={`pl-10 ${errors.endDate ? "border-red-300" : "border-gray-200"}`}
                  />
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Period Duration Info */}
            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Duration: </span>
                  {Math.ceil(
                    (new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1}{" "}
                  days
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any notes about this inventory period..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="border-gray-200"
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <p className="text-sm text-gray-600">
                After creating this period, you'll be able to:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
                <li>Add beginning inventory snapshots</li>
                <li>Record purchases during the period</li>
                <li>Add ending inventory snapshots</li>
                <li>Calculate COGS automatically</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/inventory")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Period
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
