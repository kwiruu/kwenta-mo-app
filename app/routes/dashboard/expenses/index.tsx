import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Upload, Edit, Trash2, Receipt } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useExpenses, useExpenseStats, useDeleteExpense } from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { ExpenseCategory, Expense } from "~/lib/api";

export function meta() {
  return [
    { title: `Operating Expenses - ${APP_CONFIG.name}` },
    { name: "description", content: "Manage your business operating expenses" },
  ];
}

const categoryLabels: Record<ExpenseCategory, string> = {
  INGREDIENTS: "Ingredients",
  LABOR: "Labor",
  UTILITIES: "Utilities",
  RENT: "Rent",
  EQUIPMENT: "Equipment",
  MARKETING: "Marketing",
  TRANSPORTATION: "Transportation",
  PACKAGING: "Packaging",
  OTHER: "Other",
};

const categoryColors: Record<ExpenseCategory, string> = {
  INGREDIENTS: "bg-green-100 text-green-700 hover:bg-green-100",
  LABOR: "bg-secondary/10 text-secondary hover:bg-secondary/10",
  UTILITIES: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  RENT: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  EQUIPMENT: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  MARKETING: "bg-pink-100 text-pink-700 hover:bg-pink-100",
  TRANSPORTATION: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  PACKAGING: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  OTHER: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

export default function ExpensesListPage() {
  const navigate = useNavigate();
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: stats } = useExpenseStats();
  const deleteExpenseMutation = useDeleteExpense();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenses =
    stats?.total ?? expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      deleteExpenseMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Get largest category from stats
  const largestCategory = stats?.byCategory?.length
    ? stats.byCategory.sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    : null;

  // Show loading state
  if (isLoading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center pt-20">
          <div className="h-64 mx-auto">
            <DotLottieReact src="/assets/file_search.lottie" loop autoplay />
          </div>
          <p className="-mt-12 text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Operating Expenses
          </h1>
          <p className="text-gray-500 mt-1">
            Track your recurring business expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
            asChild
          >
            <Link to="/dashboard/expenses/upload">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
          <Button variant="green" asChild>
            <Link to="/dashboard/expenses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border shadow-none bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">
              Total Expenses
            </CardDescription>
            <CardTitle className="text-2xl text-gray-900">
              {formatCurrency(totalExpenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Sum of all recorded expenses
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-none bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">
              Number of Expenses
            </CardDescription>
            <CardTitle className="text-2xl text-gray-900">
              {expenses.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Across {stats?.byCategory?.length ?? 0} categories
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-none bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">
              Largest Category
            </CardDescription>
            <CardTitle className="text-2xl text-gray-900">
              {largestCategory ? categoryLabels[largestCategory.category] : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              {largestCategory
                ? formatCurrency(Number(largestCategory.amount))
                : "No expenses yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-gray-200"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="border shadow-none bg-white">
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No expenses found
              </h3>
              <p className="text-gray-500 mb-4 max-w-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Track your operating expenses to calculate accurate product costs."}
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-200" asChild>
                    <Link to="/dashboard/expenses/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Link>
                  </Button>
                  <Button variant="green" asChild>
                    <Link to="/dashboard/expenses/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium pl-4">
                    Description
                  </TableHead>
                  <TableHead className="text-gray-500 font-medium">
                    Category
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-medium">
                    Amount
                  </TableHead>
                  <TableHead className="text-gray-500 font-medium">
                    Date
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-medium pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="border-gray-100">
                    <TableCell className="font-medium text-gray-900 pl-4">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[expense.category]}>
                        {categoryLabels[expense.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-900">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(expense.expenseDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-primary hover:bg-primary/10"
                          onClick={() =>
                            navigate(`/dashboard/expenses/${expense.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            deleteConfirm === expense.id
                              ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                          }
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
