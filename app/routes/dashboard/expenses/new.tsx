import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Save } from 'lucide-react';
import { useToast } from '~/hooks/use-toast';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useCreateExpense } from '~/hooks';
import { APP_CONFIG } from '~/config/app';
import type { ExpenseCategory } from '~/lib/api';

export function meta() {
  return [
    { title: `Add Expense - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Add a new operating expense' },
  ];
}

const expenseCategories: {
  value: ExpenseCategory;
  label: string;
  description: string;
}[] = [
  { value: 'RENT', label: 'Rent', description: 'Stall or store rental' },
  {
    value: 'ELECTRICITY',
    label: 'Electricity',
    description: 'Electric bills (Meralco, VECO, etc.)',
  },
  {
    value: 'WATER',
    label: 'Water',
    description: 'Water bills (MCWD, Maynilad, etc.)',
  },
  {
    value: 'GAS',
    label: 'Gas',
    description: 'LPG or natural gas bills',
  },
  {
    value: 'INTERNET',
    label: 'Internet',
    description: 'Internet and phone bills',
  },
  {
    value: 'UTILITIES',
    label: 'Utilities (Other)',
    description: 'Other utility expenses',
  },
  { value: 'SALARIES', label: 'Salaries', description: 'Employee wages' },
  {
    value: 'FIXED_SALARIES',
    label: 'Fixed Salaries',
    description: 'Fixed employee wages',
  },
  {
    value: 'EQUIPMENT',
    label: 'Equipment',
    description: 'Kitchen equipment, tools',
  },
  {
    value: 'MAINTENANCE',
    label: 'Maintenance',
    description: 'Repairs, upkeep',
  },
  {
    value: 'MARKETING',
    label: 'Marketing',
    description: 'Advertising, promotions',
  },
  {
    value: 'PACKAGING',
    label: 'Packaging',
    description: 'Containers, packaging materials',
  },
  {
    value: 'SUPPLIES',
    label: 'Supplies',
    description: 'Office and kitchen supplies',
  },
  {
    value: 'TRANSPORTATION',
    label: 'Transportation',
    description: 'Delivery, commute',
  },
  {
    value: 'DELIVERY_FEES',
    label: 'Delivery Fees',
    description: 'Third-party delivery costs',
  },
  {
    value: 'TRANSACTION_FEES',
    label: 'Transaction Fees',
    description: 'Payment processing fees',
  },
  {
    value: 'INSURANCE_LICENSES',
    label: 'Insurance',
    description: 'Business insurance',
  },
  {
    value: 'PERMITS_LICENSES',
    label: 'Permits & Licenses',
    description: 'Business permits, licenses',
  },
  {
    value: 'DEPRECIATION',
    label: 'Depreciation',
    description: 'Asset depreciation',
  },
  {
    value: 'TAX_EXPENSE',
    label: 'Taxes',
    description: 'Business taxes',
  },
  {
    value: 'INTEREST_EXPENSE',
    label: 'Interest',
    description: 'Loan interest payments',
  },
  {
    value: 'BANK_CHARGES',
    label: 'Bank Charges',
    description: 'Banking fees',
  },
  { value: 'OTHER', label: 'Other', description: 'Miscellaneous expenses' },
];

const frequencyOptions = [
  { value: 'DAILY', label: 'Daily', multiplier: '×30 = monthly' },
  { value: 'WEEKLY', label: 'Weekly', multiplier: '×4 = monthly' },
  { value: 'MONTHLY', label: 'Monthly', multiplier: '' },
  { value: 'QUARTERLY', label: 'Quarterly', multiplier: '÷3 = monthly' },
  { value: 'YEARLY', label: 'Yearly', multiplier: '÷12 = monthly' },
];

export default function NewExpensePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createExpenseMutation = useCreateExpense();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    description: '',
    category: '' as ExpenseCategory,
    amount: '',
    frequency: 'MONTHLY',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Expense description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!formData.frequency) {
      newErrors.frequency = 'Please select frequency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createExpenseMutation.mutate(
      {
        category: formData.category,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        frequency: formData.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        expenseDate: formData.expenseDate,
        notes: formData.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Expense added!',
            description: `${formData.description} has been saved successfully.`,
          });
          navigate('/dashboard/expenses');
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Failed to add expense',
            description: error instanceof Error ? error.message : 'An error occurred',
          });
        },
      }
    );
  };

  // Calculate monthly equivalent
  const calculateMonthly = () => {
    const amount = parseFloat(formData.amount) || 0;
    switch (formData.frequency) {
      case 'DAILY':
        return amount * 30;
      case 'WEEKLY':
        return amount * 4;
      case 'MONTHLY':
        return amount;
      case 'QUARTERLY':
        return amount / 3;
      case 'YEARLY':
        return amount / 12;
      default:
        return amount;
    }
  };

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
        <Link to="/dashboard/expenses">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add Expense</h1>
        <p className="text-gray-500 mt-1">Track a new operating expense for your business</p>
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
              Enter the details for your operating expense
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'border-red-300' : 'border-gray-200'}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                <SelectTrigger className={errors.category ? 'border-red-300' : 'border-gray-200'}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex flex-col">
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Amount, Frequency and Date Row */}
            <div className="grid gap-4 sm:grid-cols-3">
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
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={errors.amount ? 'border-red-300' : 'border-gray-200'}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-gray-700">
                  Frequency *
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger
                    className={errors.frequency ? 'border-red-300' : 'border-gray-200'}
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
                {errors.frequency && <p className="text-sm text-red-500">{errors.frequency}</p>}
              </div>

              {/* Expense Date */}
              <div className="space-y-2">
                <Label htmlFor="expenseDate" className="text-gray-700">
                  Date *
                </Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="border-gray-200"
                />
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
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" className="border-gray-200 text-gray-700" asChild>
            <Link to="/dashboard/expenses">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={createExpenseMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createExpenseMutation.isPending ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Expense
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
