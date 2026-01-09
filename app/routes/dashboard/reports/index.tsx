import { useState } from "react";
import { Link } from "react-router";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Warehouse,
  Receipt,
  Minus,
  Plus,
  Download,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  useFinancialCOGS,
  useOperatingExpenses,
  useVariableCosts,
  useFixedCosts,
  useSalesRevenue,
  useGrossProfit,
  useOperatingIncome,
  useOtherExpenses,
  useNetProfit,
  useFullIncomeStatement,
  useRecipes,
  useRecipeCostBreakdown,
  useCOGSReport,
  useProfitSummary,
  useExpenses,
  useExpenseStats,
} from "~/hooks";
import { reportsApi } from "~/lib/api";
import { APP_CONFIG } from "~/config/app";

export function meta() {
  return [
    { title: `Financial Reports - ${APP_CONFIG.name}` },
    { name: "description", content: "View your financial reports and metrics" },
  ];
}

type ReportType = "cogs" | "expense" | "income" | "profit";

export default function ReportsIndex() {
  // Date range state
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  // Active tab state
  const [activeReport, setActiveReport] = useState<ReportType>("cogs");

  // Selected recipe for recipe costing
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");

  // Collapsible states
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "income-statement",
  ]);

  // Fetch all financial data for advanced section
  const { data: cogs, isLoading: loadingCOGS } = useFinancialCOGS(
    startDate,
    endDate
  );
  const { data: opex, isLoading: loadingOpex } = useOperatingExpenses(
    startDate,
    endDate
  );
  const { data: variableCosts, isLoading: loadingVariable } = useVariableCosts(
    startDate,
    endDate
  );
  const { data: fixedCosts, isLoading: loadingFixed } = useFixedCosts(
    startDate,
    endDate
  );
  const { data: salesRevenue, isLoading: loadingSales } = useSalesRevenue(
    startDate,
    endDate
  );
  const { data: grossProfit, isLoading: loadingGross } = useGrossProfit(
    startDate,
    endDate
  );
  const { data: operatingIncome, isLoading: loadingOperating } =
    useOperatingIncome(startDate, endDate);
  const { data: otherExpenses, isLoading: loadingOther } = useOtherExpenses(
    startDate,
    endDate
  );
  const { data: netProfit, isLoading: loadingNet } = useNetProfit(
    startDate,
    endDate
  );
  const { data: incomeStatement, isLoading: loadingStatement } =
    useFullIncomeStatement(startDate, endDate);
  const { data: recipes = [] } = useRecipes();
  const { data: recipeCost, isLoading: loadingRecipe } =
    useRecipeCostBreakdown(selectedRecipeId);

  // Fetch data for basic reports tabs
  const { data: cogsReport, isLoading: cogsReportLoading } = useCOGSReport(
    startDate,
    endDate
  );
  const { data: profitSummary, isLoading: profitLoading } = useProfitSummary(
    startDate,
    endDate
  );
  const { data: expenses = [] } = useExpenses({
    startDate: startDate,
    endDate: endDate,
  });
  const { data: stats } = useExpenseStats(startDate, endDate);

  const isLoading =
    loadingCOGS ||
    loadingOpex ||
    loadingVariable ||
    loadingFixed ||
    loadingSales ||
    loadingGross ||
    loadingOperating ||
    loadingOther ||
    loadingNet ||
    loadingStatement ||
    cogsReportLoading ||
    profitLoading;

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Quick date range selection
  const setQuickRange = (range: string) => {
    const now = new Date();
    let start: Date;
    const end: Date = new Date();

    switch (range) {
      case "today":
        start = new Date();
        break;
      case "week":
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case "month":
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(end.getMonth() / 3);
        start = new Date(end.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        start = new Date(end.getFullYear(), 0, 1);
        break;
      default:
        start = firstDayOfMonth;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleExportCSV = async (
    type: "sales" | "expenses" | "ingredients"
  ) => {
    try {
      const csv = await reportsApi.exportCSV(type, startDate, endDate);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report-${startDate}-to-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const handleExportExcel = async (type: "sales" | "expenses") => {
    try {
      const blob = await reportsApi.exportExcel(type, startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report-${startDate}-to-${endDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error);
      alert("Failed to export Excel. Please try again.");
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Financial Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive financial analysis and business analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportExcel("sales")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportExcel("expenses")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Expenses
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card className="border-none p-0 m-0 shadow-none bg-white">
        <CardContent className="p-0 mb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange("today")}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange("week")}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange("month")}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange("quarter")}
              >
                This Quarter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange("year")}
              >
                This Year
              </Button>
            </div>

            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-sm text-gray-600">
                  From
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-200 w-40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-sm text-gray-600">
                  To
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-gray-200 w-40"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )} */}

      {/* Report Tabs */}
      <Tabs
        value={activeReport}
        onValueChange={(v) => setActiveReport(v as ReportType)}
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
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
                  {expenseData.length > 0 ? (
                    <>
                      {expenseData.map((expense, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {expense.category}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(expense.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            {(
                              (Number(expense.amount) / totalExpenses) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totalExpenses)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          100%
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No expense data available for this period. Add expenses
                        to see the breakdown.
                      </TableCell>
                    </TableRow>
                  )}
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
                  {(incomeStatement?.revenue?.foodSales ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Food Sales</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.revenue?.foodSales ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.revenue?.beverageSales ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Beverage Sales</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.revenue?.beverageSales ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.revenue?.cateringSales ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Catering Sales</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.revenue?.cateringSales ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.revenue?.deliverySales ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Sales</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.revenue?.deliverySales ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Revenue</span>
                    <span>
                      {formatCurrency(
                        incomeStatement?.revenue?.totalRevenue ?? 0
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
                  {(incomeStatement?.operatingExpenses?.rent ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Rent</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.rent ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.utilities ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Utilities</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.utilities ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.salaries ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Salaries</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.salaries ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.marketing ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Marketing</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.marketing ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.supplies ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Supplies</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.supplies ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.maintenance ?? 0) >
                    0 && (
                    <div className="flex justify-between">
                      <span>Maintenance</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.maintenance ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.insuranceLicenses ??
                    0) > 0 && (
                    <div className="flex justify-between">
                      <span>Insurance & Licenses</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses
                            ?.insuranceLicenses ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  {(incomeStatement?.operatingExpenses?.miscellaneous ?? 0) >
                    0 && (
                    <div className="flex justify-between">
                      <span>Miscellaneous</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.miscellaneous ?? 0
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Operating Expenses</span>
                    <span>
                      {formatCurrency(
                        incomeStatement?.operatingExpenses?.total ?? 0
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
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-lightgreenz/10 border border-lightgreenz/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-lightgreenz mt-0.5"
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

      {/* Key Metrics Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sales Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(salesRevenue?.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrency(grossProfit?.grossProfit)}
                </p>
                <p className="text-xs text-gray-400">
                  {grossProfit?.grossProfitMargin?.toFixed(1)}% margin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Operating Income</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {formatCurrency(operatingIncome?.operatingIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  (netProfit?.netProfit || 0) >= 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {(netProfit?.netProfit || 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p
                  className={`text-2xl font-semibold ${
                    (netProfit?.netProfit || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(netProfit?.netProfit)}
                </p>
                <p className="text-xs text-gray-400">
                  {netProfit?.netProfitMargin?.toFixed(1)}% margin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Income Statement */}
      <Collapsible
        open={expandedSections.includes("income-statement")}
        onOpenChange={() => toggleSection("income-statement")}
      >
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-gray-900">
                    Income Statement
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Complete profit and loss breakdown
                  </CardDescription>
                </div>
              </div>
              {expandedSections.includes("income-statement") ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Revenue Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    Revenue
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food Sales</span>
                      <span className="font-medium">
                        {formatCurrency(incomeStatement?.revenue?.foodSales)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beverage Sales</span>
                      <span className="font-medium">
                        {formatCurrency(
                          incomeStatement?.revenue?.beverageSales
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catering</span>
                      <span className="font-medium">
                        {formatCurrency(
                          incomeStatement?.revenue?.cateringSales
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium">
                        {formatCurrency(
                          incomeStatement?.revenue?.deliverySales
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-blue-700">
                      <span>Total Sales Revenue</span>
                      <span>
                        {formatCurrency(incomeStatement?.revenue?.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COGS Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-500" />
                    Cost of Goods Sold (COGS)
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beginning Inventory</span>
                      <span className="font-medium">
                        {formatCurrency(cogs?.beginningInventory?.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <Plus className="h-3 w-3 inline mr-1" />
                        Purchases
                      </span>
                      <span className="font-medium">
                        {formatCurrency(cogs?.purchases?.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <Minus className="h-3 w-3 inline mr-1" />
                        Ending Inventory
                      </span>
                      <span className="font-medium">
                        {formatCurrency(cogs?.endingInventory?.total)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-orange-700">
                      <span>Total COGS</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.costOfGoodsSold ?? cogs?.cogs
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Gross Profit
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-700">
                        {formatCurrency(
                          incomeStatement?.grossProfit ??
                            grossProfit?.grossProfit
                        )}
                      </span>
                      <p className="text-xs text-green-600">
                        {(
                          incomeStatement?.grossProfitMargin ??
                          grossProfit?.grossProfitMargin ??
                          0
                        ).toFixed(1)}
                        % margin
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operating Expenses Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-purple-500" />
                    Operating Expenses
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {incomeStatement?.operatingExpenses ? (
                      <>
                        {incomeStatement.operatingExpenses.rent > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rent</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.rent
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.utilities > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Utilities</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.utilities
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.salaries > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Salaries</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.salaries
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.marketing > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Marketing</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.marketing
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.supplies > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supplies</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.supplies
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.maintenance > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.maintenance
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.insuranceLicenses >
                          0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Insurance & Licenses
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses
                                  .insuranceLicenses
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.operatingExpenses.miscellaneous >
                          0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Miscellaneous</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.operatingExpenses.miscellaneous
                              )}
                            </span>
                          </div>
                        )}
                      </>
                    ) : opex?.byCategory && opex.byCategory.length > 0 ? (
                      opex.byCategory.slice(0, 5).map((cat) => (
                        <div
                          key={cat.category}
                          className="flex justify-between"
                        >
                          <span className="text-gray-600 capitalize">
                            {cat.category.replace(/_/g, " ").toLowerCase()}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No operating expenses data available
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-purple-700">
                      <span>Total Operating Expenses</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.operatingExpenses?.total ??
                            opex?.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Income */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-purple-800 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Operating Income
                    </span>
                    <span className="text-xl font-bold text-purple-700">
                      {formatCurrency(
                        incomeStatement?.operatingIncome ??
                          operatingIncome?.operatingIncome
                      )}
                    </span>
                  </div>
                </div>

                {/* Other Expenses */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-500" />
                    Other Expenses
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {incomeStatement?.otherExpenses ? (
                      <>
                        {incomeStatement.otherExpenses.taxExpense > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax Expense</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.otherExpenses.taxExpense
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.otherExpenses.interestExpense > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Interest Expense
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.otherExpenses.interestExpense
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.otherExpenses.depreciation > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Depreciation</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.otherExpenses.depreciation
                              )}
                            </span>
                          </div>
                        )}
                        {incomeStatement.otherExpenses.bankCharges > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bank Charges</span>
                            <span className="font-medium">
                              {formatCurrency(
                                incomeStatement.otherExpenses.bankCharges
                              )}
                            </span>
                          </div>
                        )}
                        <Separator />
                      </>
                    ) : null}
                    <div className="flex justify-between font-medium text-gray-700">
                      <span>Total Other Expenses</span>
                      <span>
                        {formatCurrency(
                          incomeStatement?.otherExpenses?.total ??
                            otherExpenses?.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div
                  className={`rounded-lg p-6 ${
                    (incomeStatement?.netProfit ?? netProfit?.netProfit ?? 0) >=
                    0
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg font-bold flex items-center gap-2 ${
                        (incomeStatement?.netProfit ??
                          netProfit?.netProfit ??
                          0) >= 0
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {(incomeStatement?.netProfit ??
                        netProfit?.netProfit ??
                        0) >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      Net Profit
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-2xl font-bold ${
                          (incomeStatement?.netProfit ??
                            netProfit?.netProfit ??
                            0) >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {formatCurrency(
                          incomeStatement?.netProfit ?? netProfit?.netProfit
                        )}
                      </span>
                      <p
                        className={`text-sm ${
                          (incomeStatement?.netProfit ??
                            netProfit?.netProfit ??
                            0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(
                          incomeStatement?.netProfitMargin ??
                          netProfit?.netProfitMargin ??
                          0
                        ).toFixed(1)}
                        % margin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Cost Breakdown */}
      <Collapsible
        open={expandedSections.includes("cost-breakdown")}
        onOpenChange={() => toggleSection("cost-breakdown")}
      >
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-gray-900">
                    Cost Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Detailed analysis of fixed and variable costs
                  </CardDescription>
                </div>
              </div>
              {expandedSections.includes("cost-breakdown") ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Fixed Costs */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-blue-500" />
                    Fixed Costs
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    {fixedCosts?.breakdown &&
                    Object.keys(fixedCosts.breakdown).length > 0 ? (
                      Object.entries(fixedCosts.breakdown).map(
                        ([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {category.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(amount as number)}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No fixed costs recorded
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-blue-700">
                      <span>Total Fixed</span>
                      <span>{formatCurrency(fixedCosts?.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Variable Costs */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Variable Costs
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    {variableCosts?.breakdown &&
                    Object.keys(variableCosts.breakdown).length > 0 ? (
                      Object.entries(variableCosts.breakdown).map(
                        ([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {category.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(amount as number)}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No variable costs recorded
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-green-700">
                      <span>Total Variable</span>
                      <span>{formatCurrency(variableCosts?.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Recipe Costing */}
      <Collapsible
        open={expandedSections.includes("recipe-costing")}
        onOpenChange={() => toggleSection("recipe-costing")}
      >
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-gray-900">
                    Recipe Costing
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Analyze costs and margins for individual recipes
                  </CardDescription>
                </div>
              </div>
              {expandedSections.includes("recipe-costing") ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="max-w-md">
                  <Label htmlFor="recipe" className="text-gray-700">
                    Select Recipe
                  </Label>
                  <Select
                    value={selectedRecipeId}
                    onValueChange={setSelectedRecipeId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a recipe to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingRecipe && selectedRecipeId && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}

                {recipeCost && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-gray-900">
                        Cost Analysis
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingredient Cost</span>
                        <span className="font-medium">
                          {formatCurrency(recipeCost.totalIngredientCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Labor Cost</span>
                        <span className="font-medium">
                          {formatCurrency(recipeCost.laborCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overhead</span>
                        <span className="font-medium">
                          {formatCurrency(recipeCost.overheadCost)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total Cost</span>
                        <span>{formatCurrency(recipeCost.totalCost)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-gray-900">
                        Profit Analysis
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selling Price</span>
                        <span className="font-medium">
                          {formatCurrency(recipeCost.sellingPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit per Recipe</span>
                        <span
                          className={`font-medium ${
                            recipeCost.profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(recipeCost.profit)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Profit Margin</span>
                        <Badge
                          className={
                            recipeCost.profitMargin >= 30
                              ? "bg-green-100 text-green-800"
                              : recipeCost.profitMargin >= 15
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {recipeCost.profitMargin.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRecipeId && !recipeCost && !loadingRecipe && (
                  <div className="text-center py-4 text-gray-500">
                    No cost data available for this recipe
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Quick Links */}
      <Card className="border shadow-none bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/purchases">
                <Truck className="h-4 w-4 mr-2" />
                Manage Purchases
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/inventory">
                <Warehouse className="h-4 w-4 mr-2" />
                Manage Inventory
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/expenses">
                <Receipt className="h-4 w-4 mr-2" />
                View Expenses
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/dashboard/sales">
                <DollarSign className="h-4 w-4 mr-2" />
                View Sales
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
