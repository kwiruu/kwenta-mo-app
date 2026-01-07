import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Truck,
  Package,
  Calendar,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { usePurchases, usePurchaseStats, useDeletePurchase } from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { InventoryType } from "~/lib/api";

export function meta() {
  return [
    { title: `Purchases - ${APP_CONFIG.name}` },
    {
      name: "description",
      content: "Manage your ingredient and material purchases",
    },
  ];
}

export default function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InventoryType | "ALL">("ALL");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: purchases = [], isLoading } = usePurchases({
    itemType: typeFilter === "ALL" ? undefined : typeFilter,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  });

  const { data: stats } = usePurchaseStats(
    dateRange.startDate || undefined,
    dateRange.endDate || undefined
  );

  const deleteMutation = useDeletePurchase();

  const filteredPurchases = purchases.filter(
    (purchase) =>
      (purchase.name || "").toLowerCase().includes(search.toLowerCase()) ||
      purchase.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
          <p className="text-gray-500 mt-1">
            Track purchases of raw materials and packaging
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/dashboard/purchases/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Purchases</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(stats?.total.amount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats?.total.count || 0} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Raw Materials</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(
                stats?.byType.find((t) => t.type === "RAW_MATERIAL")?.amount ||
                  0
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats?.byType.find((t) => t.type === "RAW_MATERIAL")?.count || 0}{" "}
              purchases
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Packaging</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(
                stats?.byType.find((t) => t.type === "PACKAGING")?.amount || 0
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats?.byType.find((t) => t.type === "PACKAGING")?.count || 0}{" "}
              purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search purchases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as InventoryType | "ALL")
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="RAW_MATERIAL">Raw Materials</SelectItem>
                <SelectItem value="PACKAGING">Packaging</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-[150px]"
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-[150px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card className="border shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Purchase Records
          </CardTitle>
          <CardDescription>
            {filteredPurchases.length} purchases found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No purchases yet
              </h3>
              <p className="text-gray-500 mt-1">
                Start by adding your first purchase
              </p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/purchases/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {purchase.name || "Unknown Item"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.itemType === "RAW_MATERIAL"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {purchase.itemType === "RAW_MATERIAL"
                          ? "Raw Material"
                          : purchase.itemType || "Other"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {purchase.supplier || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {purchase.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(purchase.unitCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(purchase.totalCost)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(purchase.purchaseDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(purchase.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
