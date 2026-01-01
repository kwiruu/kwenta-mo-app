import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Receipt, Save, Trash2 } from "lucide-react";
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
import { useExpense, useUpdateExpense, useDeleteExpense } from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { ExpenseCategory } from "~/lib/api";

export function meta() {
  return [
    { title: `Edit Expense - ${APP_CONFIG.name}` },
    { name: "description", content: "Edit operating expense details" },
  ];
}

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: "RENT", label: "Rent" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "LABOR", label: "Salaries" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PACKAGING", label: "Supplies" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "INGREDIENTS", label: "Ingredients" },
  { value: "OTHER", label: "Other" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function EditExpensePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: expense, isLoading: isLoadingExpense } = useExpense(id!);
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    description: "",
    category: "" as ExpenseCategory,
    amount: "",
    frequency: "MONTHLY",
    notes: "",
  });

  // Load expense data
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        category: expense.category,
        amount: expense.amount.toString(),
        frequency: "MONTHLY",
        notes: expense.notes || "",
      });
    }
  }, [expense]);

  // Show loading state
  if (isLoadingExpense) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greenz mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading expense...</p>
        </div>
      </div>
    );
  }

  // Redirect if expense not found
  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border shadow-none bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Expense Not Found
            </h2>
            <p className="text-gray-500 mb-4">
              The expense you're looking for doesn't exist or has been deleted.
            </p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/dashboard/expenses">Go to Expenses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Expense description is required";
    }
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Enter a valid amount";
    }
    if (!formData.frequency) {
      newErrors.frequency = "Please select frequency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    updateExpenseMutation.mutate(
      {
        id: id!,
        data: {
          category: formData.category,
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          notes: formData.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => navigate("/dashboard/expenses"),
        onError: (error) => console.error("Error updating expense:", error),
      }
    );
  };

  const handleDelete = async () => {
    deleteExpenseMutation.mutate(id!, {
      onSuccess: () => navigate("/dashboard/expenses"),
      onError: (error) => console.error("Error deleting expense:", error),
    });
  };

  // Calculate monthly equivalent
  const calculateMonthly = () => {
    const amount = parseFloat(formData.amount) || 0;
    switch (formData.frequency) {
      case "daily":
        return amount * 30;
      case "weekly":
        return amount * 4;
      case "monthly":
        return amount;
      case "quarterly":
        return amount / 3;
      case "yearly":
        return amount / 12;
      default:
        return amount;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        asChild
        className="-ml-2 text-gray-600 hover:text-gray-900"
      >
        <Link to="/dashboard/expenses">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Expense</h1>
          <p className="text-gray-500 mt-1">
            Update the details for {expense.description}
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
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-500" />
              </div>
              Expense Details
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update the details for your operating expense
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expense Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Expense Description *
              </Label>
              <Input
                id="description"
                placeholder="e.g., Store Rent, Electricity Bill"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={
                  errors.description ? "border-red-300" : "border-gray-200"
                }
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as ExpenseCategory,
                  })
                }
              >
                <SelectTrigger
                  className={
                    errors.category ? "border-red-300" : "border-gray-200"
                  }
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Amount and Frequency Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-700">
                  Amount (₱) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={
                    errors.amount ? "border-red-300" : "border-gray-200"
                  }
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-gray-700">
                  Frequency *
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger
                    className={
                      errors.frequency ? "border-red-300" : "border-gray-200"
                    }
                  >
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-sm text-red-500">{errors.frequency}</p>
                )}
              </div>
            </div>

            {/* Monthly Equivalent Preview */}
            {formData.amount && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-gray-500 mb-1">Monthly Equivalent</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(calculateMonthly())} /month
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about this expense..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
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
            <Link to="/dashboard/expenses">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={updateExpenseMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {updateExpenseMutation.isPending ? (
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
