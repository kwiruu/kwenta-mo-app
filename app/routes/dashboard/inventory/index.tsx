import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Package,
  Check,
  Clock,
  Edit,
  Trash2,
  TrendingUp,
  ShoppingCart,
  Calendar,
  ChevronDown,
  Settings,
  CheckCircle,
  AlertTriangle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  usePurchases,
  usePurchaseStats,
  useCreatePurchase,
  useUpdatePurchase,
  useDeletePurchase,
  useLowStockAlerts,
} from "~/hooks/usePurchases";
import {
  useActivePeriod,
  useInventoryPeriods,
  useCreateInventoryPeriod,
  useSetActivePeriod,
} from "~/hooks/useInventory";
import { APP_CONFIG } from "~/config/app";
import type {
  CreatePurchaseDto,
  InventoryType,
  PurchaseStatus,
  Purchase,
} from "~/lib/api";

export function meta() {
  return [
    { title: `Inventory - ${APP_CONFIG.name}` },
    {
      name: "description",
      content: "Manage your inventory with the Active Period system",
    },
  ];
}

export default function InventoryPage() {
  // Period hooks
  const { data: activePeriod, isLoading: periodLoading } = useActivePeriod();
  const { data: allPeriods = [] } = useInventoryPeriods();
  const setActivePeriodMutation = useSetActivePeriod();
  const createPeriodMutation = useCreateInventoryPeriod();

  // Purchase hooks - filtered by active period
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases({
    periodId: activePeriod?.id,
  });
  const { data: purchaseStats } = usePurchaseStats();
  const { data: lowStockItems = [] } = useLowStockAlerts();

  // Mutations
  const createPurchaseMutation = useCreatePurchase();
  const updatePurchaseMutation = useUpdatePurchase();
  const deletePurchaseMutation = useDeletePurchase();

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PurchaseStatus>(
    "all"
  );
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [itemForm, setItemForm] = useState<CreatePurchaseDto>({
    itemName: "",
    itemType: "RAW_MATERIAL" as InventoryType,
    status: "PURCHASED" as PurchaseStatus,
    quantity: 0,
    unit: "pcs",
    unitCost: 0,
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [periodForm, setPeriodForm] = useState({
    periodName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });

  // Computed values
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const matchesSearch =
        (purchase.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        purchase.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || purchase.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  const purchasedItems = useMemo(() => {
    return purchases.filter((p) => p.status === "PURCHASED");
  }, [purchases]);

  const plannedItems = useMemo(() => {
    return purchases.filter((p) => p.status === "PLANNED");
  }, [purchases]);

  const totalInventoryValue = useMemo(() => {
    return purchasedItems.reduce((sum, p) => sum + Number(p.totalCost), 0);
  }, [purchasedItems]);

  const plannedValue = useMemo(() => {
    return plannedItems.reduce((sum, p) => sum + Number(p.totalCost), 0);
  }, [plannedItems]);

  // Aggregate items by name for stock view
  const stockByItem = useMemo(() => {
    const itemMap = new Map<
      string,
      { name: string; quantity: number; totalCost: number; lastCost: number }
    >();
    purchasedItems.forEach((p) => {
      const itemName = p.name || "Unknown";
      const existing = itemMap.get(itemName);
      if (existing) {
        existing.quantity += Number(p.quantity);
        existing.totalCost += Number(p.totalCost);
        existing.lastCost = Number(p.unitCost);
      } else {
        itemMap.set(itemName, {
          name: itemName,
          quantity: Number(p.quantity),
          totalCost: Number(p.totalCost),
          lastCost: Number(p.unitCost),
        });
      }
    });
    return Array.from(itemMap.values());
  }, [purchasedItems]);

  // Helpers
  const formatInventoryType = (type: InventoryType) => {
    const typeMap: Record<InventoryType, string> = {
      RAW_MATERIAL: "Raw Material",
      PACKAGING: "Packaging",
      INGREDIENT: "Ingredient",
      SPICE: "Spice",
      CONDIMENT: "Condiment",
      BEVERAGE: "Beverage",
      DAIRY: "Dairy",
      PRODUCE: "Produce",
      PROTEIN: "Protein",
      GRAIN: "Grain",
      OIL: "Oil",
      SUPPLY: "Supply",
      EQUIPMENT: "Equipment",
      OTHER: "Other",
    };
    return typeMap[type] || type;
  };

  const getInventoryTypeColor = (type: InventoryType) => {
    const colorMap: Record<InventoryType, string> = {
      RAW_MATERIAL: "border-blue-200 bg-blue-50 text-blue-700",
      INGREDIENT: "border-green-200 bg-green-50 text-green-700",
      SPICE: "border-orange-200 bg-orange-50 text-orange-700",
      CONDIMENT: "border-yellow-200 bg-yellow-50 text-yellow-700",
      BEVERAGE: "border-cyan-200 bg-cyan-50 text-cyan-700",
      DAIRY: "border-indigo-200 bg-indigo-50 text-indigo-700",
      PRODUCE: "border-lime-200 bg-lime-50 text-lime-700",
      PROTEIN: "border-red-200 bg-red-50 text-red-700",
      GRAIN: "border-amber-200 bg-amber-50 text-amber-700",
      OIL: "border-yellow-200 bg-yellow-50 text-yellow-700",
      PACKAGING: "border-purple-200 bg-purple-50 text-purple-700",
      SUPPLY: "border-gray-200 bg-gray-50 text-gray-700",
      EQUIPMENT: "border-slate-200 bg-slate-50 text-slate-700",
      OTHER: "border-gray-200 bg-gray-50 text-gray-700",
    };
    return colorMap[type] || "border-gray-200 bg-gray-50 text-gray-700";
  };

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

  // Handlers
  const handleDeleteItem = () => {
    if (!deleteItemId) return;
    deletePurchaseMutation.mutate(deleteItemId, {
      onSuccess: () => setDeleteItemId(null),
    });
  };

  const handleOpenItemModal = (item?: Purchase) => {
    if (item) {
      setEditMode(true);
      setSelectedItem(item);
      setItemForm({
        itemName: item.name || "",
        itemType: item.itemType || "RAW_MATERIAL",
        status: item.status,
        quantity: Number(item.quantity),
        unit: item.unit || "pcs",
        unitCost: Number(item.unitCost),
        supplier: item.supplier || "",
        purchaseDate: item.purchaseDate.split("T")[0],
        notes: item.notes || "",
      });
    } else {
      setEditMode(false);
      setSelectedItem(null);
      setItemForm({
        itemName: "",
        itemType: "RAW_MATERIAL",
        status: "PURCHASED",
        quantity: 0,
        unit: "pcs",
        unitCost: 0,
        supplier: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    if (editMode && selectedItem) {
      updatePurchaseMutation.mutate(
        { id: selectedItem.id, data: itemForm },
        { onSuccess: () => setShowItemModal(false) }
      );
    } else {
      createPurchaseMutation.mutate(
        { ...itemForm, periodId: activePeriod?.id },
        { onSuccess: () => setShowItemModal(false) }
      );
    }
  };

  const handleMarkAsPurchased = (item: Purchase) => {
    updatePurchaseMutation.mutate({
      id: item.id,
      data: { status: "PURCHASED" },
    });
  };

  const handleCreatePeriod = () => {
    createPeriodMutation.mutate(periodForm, {
      onSuccess: (newPeriod) => {
        setShowPeriodModal(false);
        // Set the new period as active
        setActivePeriodMutation.mutate(newPeriod.id);
        setPeriodForm({
          periodName: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          )
            .toISOString()
            .split("T")[0],
        });
      },
    });
  };

  // Loading state
  if (periodLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center pt-20">
          <div className="h-64 mx-auto">
            <DotLottieReact src="/assets/loading.lottie" loop autoplay />
          </div>
          <p className="-mt-12 text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Purchase-based inventory tracking with active periods
          </p>
        </div>
        <div className="flex gap-2">
          {/* Period Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-48 justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{activePeriod?.periodName || "Select Period"}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {allPeriods.map((period) => (
                <DropdownMenuItem
                  key={period.id}
                  onClick={() => setActivePeriodMutation.mutate(period.id)}
                  className="flex items-center justify-between"
                >
                  <span>{period.periodName}</span>
                  {period.isActive && (
                    <Badge
                      variant="outline"
                      className="text-xs border-green-300 bg-green-50 text-green-700"
                    >
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowPeriodModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Period
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="green" onClick={() => handleOpenItemModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Purchased Value</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(totalInventoryValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unique Items</p>
                <p className="text-xl font-semibold text-gray-900">
                  {stockByItem.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Planned Items</p>
                <p className="text-xl font-semibold text-gray-900">
                  {plannedItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Planned Value</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(plannedValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Cards */}
      {lowStockItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Low Stock Alerts ({lowStockItems.length} items)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <Card
                key={item.id}
                className="border border-amber-200 bg-amber-50/50 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.supplier && `${item.supplier} • `}
                        {formatInventoryType(item.itemType || "OTHER")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${
                            item.quantity < 0
                              ? "bg-red-100 text-red-800 border-red-300"
                              : item.quantity === 0
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {item.quantity < 0
                            ? `Out of stock (${Math.abs(item.quantity).toFixed(1)} ${item.unit})`
                            : item.quantity === 0
                              ? `Empty stock`
                              : `${item.quantity.toFixed(1)} ${item.unit} remaining`}
                        </Badge>
                      </div>
                      {item.reorderLevel && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reorder at: {item.reorderLevel} {item.unit}
                        </p>
                      )}
                    </div>
                    <div className="ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-700 border-amber-300 hover:bg-amber-100"
                        onClick={() => handleOpenItemModal(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Planned Items Alert */}
      {plannedItems.length > 0 && (
        <Card className="border-amber-100 bg-amber-50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Shopping List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600 text-sm">
              {plannedItems.length} planned item(s) totaling{" "}
              {formatCurrency(plannedValue)}:{" "}
              {plannedItems
                .slice(0, 3)
                .map((i) => i.name || "Unknown")
                .join(", ")}
              {plannedItems.length > 3 &&
                ` and ${plannedItems.length - 3} more`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="stock">Stock Summary</TabsTrigger>
            <TabsTrigger value="planned">Shopping List</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-200"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "all" | PurchaseStatus)
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PURCHASED">Purchased</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="border shadow-none bg-white">
            <CardContent className="p-0">
              {purchasesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No items found
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-sm">
                    {searchQuery
                      ? "Try a different search term"
                      : "Add your first item to start tracking inventory."}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="green"
                      onClick={() => handleOpenItemModal()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-gray-500 font-medium pl-4">
                        Item
                      </TableHead>
                      <TableHead className="text-gray-500 font-medium">
                        Type
                      </TableHead>
                      <TableHead className="text-gray-500 font-medium">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">
                        Qty
                      </TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">
                        Unit Cost
                      </TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">
                        Total
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
                    {filteredPurchases.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`border-gray-100 ${item.status === "PLANNED" ? "bg-amber-50/50" : ""}`}
                      >
                        <TableCell className="font-medium text-gray-900 pl-4">
                          <div>
                            <span>{item.name || "Unknown"}</span>
                            {item.supplier && (
                              <span className="block text-xs text-gray-400">
                                {item.supplier}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getInventoryTypeColor(
                              item.itemType || "OTHER"
                            )}
                          >
                            {formatInventoryType(item.itemType || "OTHER")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.status === "PURCHASED" ? (
                            <Badge
                              variant="outline"
                              className="border-green-300 bg-green-50 text-green-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Purchased
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-300 bg-amber-50 text-amber-700"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Planned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-gray-900">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-gray-900">
                          {formatCurrency(item.unitCost)}
                        </TableCell>
                        <TableCell className="text-right text-gray-900 font-medium">
                          {formatCurrency(item.totalCost)}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(item.purchaseDate)}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex justify-end gap-1">
                            {item.status === "PLANNED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleMarkAsPurchased(item)}
                                title="Mark as Purchased"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-primary hover:bg-primary/10"
                              onClick={() => handleOpenItemModal(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => setDeleteItemId(item.id)}
                              title="Delete"
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
        </TabsContent>

        {/* Stock Summary Tab */}
        <TabsContent value="stock">
          <Card className="border shadow-none bg-white">
            <CardHeader>
              <CardTitle>Stock Summary</CardTitle>
              <CardDescription>
                Aggregated view of purchased items in this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockByItem.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No purchased items in this period
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">
                        Total Quantity
                      </TableHead>
                      <TableHead className="text-right">
                        Last Unit Cost
                      </TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockByItem.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.lastCost)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopping List Tab */}
        <TabsContent value="planned">
          <Card className="border shadow-none bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Shopping List
              </CardTitle>
              <CardDescription>
                Items you&apos;re planning to purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plannedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 mx-auto">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No planned items. Add items with &quot;Planned&quot; status
                    to create a shopping list.
                  </p>
                  <Button onClick={() => handleOpenItemModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Planned Item
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Est. Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plannedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {item.supplier || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleMarkAsPurchased(item)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Purchased
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Modal */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Item" : "Add Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Update the item details below."
                : "Add a new item. Choose 'Planned' to add to your shopping list."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={itemForm.itemName}
                onChange={(e) =>
                  setItemForm({ ...itemForm, itemName: e.target.value })
                }
                placeholder="e.g., Rice, Onion, Packaging Box"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="itemType">Type</Label>
                <Select
                  value={itemForm.itemType}
                  onValueChange={(value) =>
                    setItemForm({
                      ...itemForm,
                      itemType: value as InventoryType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                    <SelectItem value="SPICE">Spice</SelectItem>
                    <SelectItem value="CONDIMENT">Condiment</SelectItem>
                    <SelectItem value="BEVERAGE">Beverage</SelectItem>
                    <SelectItem value="DAIRY">Dairy</SelectItem>
                    <SelectItem value="PRODUCE">Produce</SelectItem>
                    <SelectItem value="PROTEIN">Protein</SelectItem>
                    <SelectItem value="GRAIN">Grain</SelectItem>
                    <SelectItem value="OIL">Oil</SelectItem>
                    <SelectItem value="PACKAGING">Packaging</SelectItem>
                    <SelectItem value="SUPPLY">Supply</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={itemForm.status}
                  onValueChange={(value) =>
                    setItemForm({
                      ...itemForm,
                      status: value as PurchaseStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PURCHASED">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Purchased
                      </div>
                    </SelectItem>
                    <SelectItem value="PLANNED">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        Planned
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={itemForm.quantity || ""}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      quantity:
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={itemForm.unit || ""}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, unit: e.target.value })
                  }
                  placeholder="e.g., kg, L, pcs, boxes"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitCost">Unit Cost (₱) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="any"
                  value={itemForm.unitCost || ""}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      unitCost:
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={itemForm.supplier}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, supplier: e.target.value })
                  }
                  placeholder="e.g., Local Market"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Date Purchased</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={itemForm.purchaseDate}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, purchaseDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={itemForm.notes}
                onChange={(e) =>
                  setItemForm({ ...itemForm, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            {itemForm.quantity > 0 && itemForm.unitCost > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="font-semibold">
                    {formatCurrency(itemForm.quantity * itemForm.unitCost)}
                  </span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={
                !itemForm.itemName ||
                itemForm.quantity <= 0 ||
                createPurchaseMutation.isPending ||
                updatePurchaseMutation.isPending
              }
            >
              {createPurchaseMutation.isPending ||
              updatePurchaseMutation.isPending
                ? "Saving..."
                : editMode
                  ? "Save Changes"
                  : itemForm.status === "PLANNED"
                    ? "Add to Shopping List"
                    : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Period Modal */}
      <Dialog open={showPeriodModal} onOpenChange={setShowPeriodModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Period</DialogTitle>
            <DialogDescription>
              Start a new inventory tracking period.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="periodName">Period Name *</Label>
              <Input
                id="periodName"
                value={periodForm.periodName}
                onChange={(e) =>
                  setPeriodForm({ ...periodForm, periodName: e.target.value })
                }
                placeholder="e.g., January 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="periodStart">Start Date</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={periodForm.startDate}
                  onChange={(e) =>
                    setPeriodForm({ ...periodForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="periodEnd">End Date</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodForm.endDate}
                  onChange={(e) =>
                    setPeriodForm({ ...periodForm, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPeriodModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePeriod}
              disabled={
                !periodForm.periodName || createPeriodMutation.isPending
              }
            >
              {createPeriodMutation.isPending ? "Creating..." : "Create Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item from your inventory. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
