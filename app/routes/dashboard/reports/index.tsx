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

type ReportType = "cogs" | "expense" | "income" | "profit";

export default function ReportsIndex() {
  const [activeReport, setActiveReport] = useState<ReportType>("cogs");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export with backend API
    alert("PDF export will be implemented with backend integration.");
  };

  // Mock data for COGS Report
  const cogsData = [
    {
      recipe: "Chicken Adobo",
      quantitySold: 150,
      materialCost: 6750,
      laborCost: 9000,
      overheadCost: 1012.5,
      totalCOGS: 16762.5,
    },
    {
      recipe: "Sinigang na Baboy",
      quantitySold: 80,
      materialCost: 4400,
      laborCost: 6400,
      overheadCost: 660,
      totalCOGS: 11460,
    },
    {
      recipe: "Kare-Kare",
      quantitySold: 45,
      materialCost: 3825,
      laborCost: 5400,
      overheadCost: 573.75,
      totalCOGS: 9798.75,
    },
  ];

  // Mock data for Expense Report
  const expenseData = [
    { category: "Rent", amount: 15000 },
    { category: "Utilities (Electric)", amount: 3500 },
    { category: "Utilities (Water)", amount: 800 },
    { category: "Supplies", amount: 2500 },
    { category: "Marketing", amount: 1500 },
    { category: "Maintenance", amount: 1000 },
    { category: "Miscellaneous", amount: 500 },
  ];

  // Mock data for Income Statement
  const incomeData = {
    revenue: {
      sales: 52500,
      otherIncome: 500,
      totalRevenue: 53000,
    },
    cogs: {
      materials: 14975,
      labor: 20800,
      overhead: 2246.25,
      totalCOGS: 38021.25,
    },
    grossProfit: 14978.75,
    operatingExpenses: {
      rent: 15000,
      utilities: 4300,
      supplies: 2500,
      marketing: 1500,
      other: 1500,
      total: 24800,
    },
    netIncome: -9821.25,
  };

  // Mock data for Profit Summary
  const profitData = [
    {
      recipe: "Chicken Adobo",
      revenue: 18000,
      cost: 16762.5,
      profit: 1237.5,
      margin: 6.88,
    },
    {
      recipe: "Sinigang na Baboy",
      revenue: 12000,
      cost: 11460,
      profit: 540,
      margin: 4.5,
    },
    {
      recipe: "Kare-Kare",
      revenue: 9000,
      cost: 9798.75,
      profit: -798.75,
      margin: -8.88,
    },
  ];

  const totalCOGS = cogsData.reduce((sum, r) => sum + r.totalCOGS, 0);
  const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = profitData.reduce((sum, r) => sum + r.profit, 0);
  const totalRevenue = profitData.reduce((sum, r) => sum + r.revenue, 0);

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
        <Button variant="green" onClick={handleExportPDF}>
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF
        </Button>
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
                  {formatCurrency(
                    cogsData.reduce((sum, r) => sum + r.materialCost, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Material Costs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    cogsData.reduce((sum, r) => sum + r.laborCost, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Labor Costs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    cogsData.reduce((sum, r) => sum + r.overheadCost, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Overhead Costs</p>
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
                    <TableHead className="text-right">Materials</TableHead>
                    <TableHead className="text-right">Labor</TableHead>
                    <TableHead className="text-right">Overhead</TableHead>
                    <TableHead className="text-right">Total COGS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cogsData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {row.recipe}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.quantitySold}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.materialCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.laborCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.overheadCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(row.totalCOGS)}
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
                  {formatCurrency(incomeData.revenue.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(incomeData.cogs.totalCOGS)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost of Goods Sold
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(incomeData.grossProfit)}
                </div>
                <p className="text-xs text-muted-foreground">Gross Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`text-2xl font-bold ${incomeData.netIncome >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                >
                  {formatCurrency(incomeData.netIncome)}
                </div>
                <p className="text-xs text-muted-foreground">Net Income</p>
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
                    <span>{formatCurrency(incomeData.revenue.sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Income</span>
                    <span>
                      {formatCurrency(incomeData.revenue.otherIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Revenue</span>
                    <span>
                      {formatCurrency(incomeData.revenue.totalRevenue)}
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
                  <div className="flex justify-between">
                    <span>Direct Materials</span>
                    <span>{formatCurrency(incomeData.cogs.materials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Labor</span>
                    <span>{formatCurrency(incomeData.cogs.labor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manufacturing Overhead</span>
                    <span>{formatCurrency(incomeData.cogs.overhead)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total COGS</span>
                    <span>{formatCurrency(incomeData.cogs.totalCOGS)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Gross Profit</span>
                  <span className="text-secondary-foreground">
                    {formatCurrency(incomeData.grossProfit)}
                  </span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Operating Expenses
                </h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span>Rent</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.rent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.utilities)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplies</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.supplies)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.marketing)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Expenses</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.other)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Operating Expenses</span>
                    <span>
                      {formatCurrency(incomeData.operatingExpenses.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div
                className={`rounded-lg p-4 ${incomeData.netIncome >= 0 ? "bg-secondary/10" : "bg-destructive/10"}`}
              >
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Income</span>
                  <span
                    className={
                      incomeData.netIncome >= 0
                        ? "text-secondary-foreground"
                        : "text-destructive"
                    }
                  >
                    {formatCurrency(incomeData.netIncome)}
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
                        {row.recipe}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.cost)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${row.profit >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                      >
                        {formatCurrency(row.profit)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${row.margin >= 0 ? "text-secondary-foreground" : "text-destructive"}`}
                      >
                        {row.margin.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {row.margin >= 20 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">
                            Healthy
                          </span>
                        ) : row.margin >= 0 ? (
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
                  .filter((r) => r.margin < 0)
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
                          {recipe.recipe} is operating at a loss
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
                  .filter((r) => r.margin >= 0 && r.margin < 20)
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
                          {recipe.recipe} has a low profit margin
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          With only {recipe.margin.toFixed(2)}% margin, consider
                          optimizing costs or adjusting pricing to achieve a
                          healthier 20%+ margin.
                        </p>
                      </div>
                    </div>
                  ))}

                {profitData.every((r) => r.margin >= 20) && (
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
