import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { reportsApi } from "~/lib/api";
import {
  useCOGSReport,
  useIncomeStatement,
  useProfitSummary,
  useExpenses,
  useExpenseStats,
} from "~/hooks";

type ReportType = "cogs" | "expense" | "income" | "profit";

export default function ReportsIndex() {
  const [activeReport, setActiveReport] = useState<ReportType>("cogs");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Use TanStack Query hooks for all report data
  const { data: cogsReport, isLoading: cogsLoading } = useCOGSReport(
    dateRange.start,
    dateRange.end
  );
  const { data: incomeStatement, isLoading: incomeLoading } =
    useIncomeStatement(dateRange.start, dateRange.end);
  const { data: profitSummary, isLoading: profitLoading } = useProfitSummary(
    dateRange.start,
    dateRange.end
  );
  const { data: expenses = [] } = useExpenses({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const { data: stats } = useExpenseStats(dateRange.start, dateRange.end);

  const isLoading = cogsLoading || incomeLoading || profitLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleExportCSV = async (
    type: "sales" | "expenses" | "ingredients"
  ) => {
    try {
      const csv = await reportsApi.exportCSV(
        type,
        dateRange.start,
        dateRange.end
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report-${dateRange.start}-to-${dateRange.end}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  // Derived data from API responses
  const cogsData = cogsReport?.byRecipe ?? [];
  const expenseData = stats?.byCategory ?? [];
  const profitData = profitSummary?.recipes ?? [];

  const totalCOGS = cogsReport?.summary.totalCOGS ?? 0;
  const totalExpenses = stats?.total ?? 0;
  const totalProfit = profitSummary?.totals.profit ?? 0;
  const totalRevenue = profitSummary?.totals.revenue ?? 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greenz mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Financial reports and business analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportCSV("sales")}>
            Export Sales
          </Button>
          <Button variant="outline" onClick={() => handleExportCSV("expenses")}>
            Export Expenses
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
            <Button variant="outline">
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs
        value={activeReport}
        onValueChange={(v) => setActiveReport(v as ReportType)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cogs">COGS Report</TabsTrigger>
          <TabsTrigger value="expense">Expense Report</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="profit">Profit Summary</TabsTrigger>
        </TabsList>

        {/* COGS Report */}
        <TabsContent value="cogs" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalCOGS)}
                </div>
                <p className="text-xs text-muted-foreground">Total COGS</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(cogsReport?.summary.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(cogsReport?.summary.grossProfit ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Gross Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {(cogsReport?.summary.grossProfitMargin ?? 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Gross Margin</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost of Goods Sold by Recipe</CardTitle>
              <CardDescription>
                Breakdown of production costs per recipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipe</TableHead>
                    <TableHead className="text-center">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cogsData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {row.recipeName}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.cogs)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(row.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Report */}
        <TabsContent value="expense" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Operating Expenses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{expenseData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Expense Categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses / (expenseData.length || 1))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average per Category
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Operating Expenses Breakdown</CardTitle>
              <CardDescription>
                Monthly operating expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseData.map((expense, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {((expense.amount / totalExpenses) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totalExpenses)}
                    </TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(incomeStatement?.revenue.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(incomeStatement?.costOfGoodsSold ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost of Goods Sold
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(incomeStatement?.grossProfit ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Gross Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`text-2xl font-bold ${(incomeStatement?.netProfit ?? 0) >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                >
                  {formatCurrency(incomeStatement?.netProfit ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income Statement</CardTitle>
              <CardDescription>
                Profit and loss summary for the period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Revenue</h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span>Sales Revenue</span>
                    <span>
                      {formatCurrency(incomeStatement?.revenue.sales ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Revenue</span>
                    <span>
                      {formatCurrency(
                        incomeStatement?.revenue.totalRevenue ?? 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Cost of Goods Sold
                </h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total COGS</span>
                    <span>
                      {formatCurrency(incomeStatement?.costOfGoodsSold ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Gross Profit</span>
                  <span className="text-secondary-foreground">
                    {formatCurrency(incomeStatement?.grossProfit ?? 0)}
                  </span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Operating Expenses
                </h3>
                <div className="space-y-2 pl-4">
                  {incomeStatement?.operatingExpenses.breakdown.map(
                    (item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.category}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    )
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Operating Expenses</span>
                    <span>
                      {formatCurrency(
                        incomeStatement?.operatingExpenses.total ?? 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div
                className={`rounded-lg p-4 ${(incomeStatement?.netProfit ?? 0) >= 0 ? "bg-secondary/10" : "bg-destructive/10"}`}
              >
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Profit</span>
                  <span
                    className={
                      (incomeStatement?.netProfit ?? 0) >= 0
                        ? "text-secondary-foreground"
                        : "text-destructive"
                    }
                  >
                    {formatCurrency(incomeStatement?.netProfit ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                  <span>Net Profit Margin</span>
                  <span>
                    {(incomeStatement?.netProfitMargin ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Summary */}
        <TabsContent value="profit" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`text-2xl font-bold ${totalProfit >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                >
                  {formatCurrency(totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`text-2xl font-bold ${totalProfit >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                >
                  {((totalProfit / totalRevenue) * 100).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Overall Margin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-secondary-foreground">
                  {profitData.filter((r) => r.profit > 0).length}/
                  {profitData.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profitable Recipes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profitability by Recipe</CardTitle>
              <CardDescription>
                Profit margin analysis for each recipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipe</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {row.recipeName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.costOfGoods)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${row.profit >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                      >
                        {formatCurrency(row.profit)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${row.profitMargin >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                      >
                        {row.profitMargin.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {row.profitMargin >= 20 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">
                            Healthy
                          </span>
                        ) : row.profitMargin >= 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                            Loss
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profitData
                  .filter((r) => r.profitMargin < 0)
                  .map((recipe, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-destructive mt-0.5"
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
                      <div>
                        <p className="font-medium text-destructive">
                          {recipe.recipeName} is operating at a loss
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consider increasing the selling price by at least{" "}
                          {formatCurrency(Math.abs(recipe.profit))}
                          or reducing ingredient/labor costs to achieve
                          profitability.
                        </p>
                      </div>
                    </div>
                  ))}

                {profitData
                  .filter((r) => r.profitMargin >= 0 && r.profitMargin < 20)
                  .map((recipe, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-600 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-yellow-800">
                          {recipe.recipeName} has a low profit margin
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          With only {recipe.profitMargin.toFixed(2)}% margin,
                          consider optimizing costs or adjusting pricing to
                          achieve a healthier 20%+ margin.
                        </p>
                      </div>
                    </div>
                  ))}

                {profitData.every((r) => r.profitMargin >= 20) && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-secondary mt-0.5"
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
                    <div>
                      <p className="font-medium text-secondary-foreground">
                        All recipes are profitable!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Great job! All your recipes have healthy profit margins
                        above 20%.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
