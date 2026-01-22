import { useState, useMemo } from 'react';
import { Link } from 'react-router';
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
  PlusCircle,
  MinusCircle,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Camera,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { NumberInput } from '~/components/ui/number-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Badge } from '~/components/ui/badge';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  usePurchases,
  usePurchaseStats,
  useCreatePurchase,
  useUpdatePurchase,
  useDeletePurchase,
  useLowStockAlerts,
} from '~/hooks/usePurchases';
import {
  useActivePeriod,
  useInventoryPeriods,
  useCreateInventoryPeriod,
  useSetActivePeriod,
} from '~/hooks/useInventory';
import { useInventoryTransactions, useRestock } from '~/hooks/useInventoryTransactions';
import { APP_CONFIG } from '~/config/app';
import type { CreatePurchaseDto, InventoryType, Purchase, TransactionType } from '~/lib/api';

export function meta() {
  return [
    { title: `Inventory - ${APP_CONFIG.name}` },
    {
      name: 'description',
      content: 'Manage your inventory with the Active Period system',
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

  // Transaction history state
  const [historyItemFilter, setHistoryItemFilter] = useState<string>('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const { data: transactions = [], isLoading: transactionsLoading } = useInventoryTransactions({
    purchaseId: historyItemFilter === 'ALL' ? undefined : historyItemFilter,
    type: historyTypeFilter === 'ALL' ? undefined : historyTypeFilter,
  });

  // Mutations
  const createPurchaseMutation = useCreatePurchase();
  const updatePurchaseMutation = useUpdatePurchase();
  const deletePurchaseMutation = useDeletePurchase();
  const restockMutation = useRestock();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Restock form state
  const [restockQuantity, setRestockQuantity] = useState(0);
  const [restockNotes, setRestockNotes] = useState('');

  // Form state
  const [itemForm, setItemForm] = useState<CreatePurchaseDto>({
    itemName: '',
    itemType: 'RAW_MATERIAL' as InventoryType,
    quantity: 0,
    unit: 'pcs',
    unitCost: 0,
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [periodForm, setPeriodForm] = useState({
    periodName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split('T')[0],
  });

  // Computed values
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const matchesSearch =
        (purchase.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [purchases, searchQuery]);

  const totalInventoryValue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + Number(p.totalCost), 0);
  }, [purchases]);

  // Aggregate items by name for stock view
  const stockByItem = useMemo(() => {
    const itemMap = new Map<
      string,
      { name: string; quantity: number; totalCost: number; lastCost: number }
    >();
    purchases.forEach((p) => {
      const itemName = p.name || 'Unknown';
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
  }, [purchases]);

  // Helpers
  const formatInventoryType = (type: InventoryType) => {
    const typeMap: Record<InventoryType, string> = {
      RAW_MATERIAL: 'Raw Material',
      PACKAGING: 'Packaging',
      INGREDIENT: 'Ingredient',
      SPICE: 'Spice',
      CONDIMENT: 'Condiment',
      BEVERAGE: 'Beverage',
      DAIRY: 'Dairy',
      PRODUCE: 'Produce',
      PROTEIN: 'Protein',
      GRAIN: 'Grain',
      OIL: 'Oil',
      SUPPLY: 'Supply',
      EQUIPMENT: 'Equipment',
      OTHER: 'Other',
    };
    return typeMap[type] || type;
  };

  const getInventoryTypeColor = (type: InventoryType) => {
    const colorMap: Record<InventoryType, string> = {
      RAW_MATERIAL: 'border-blue-200 bg-blue-50 text-blue-700',
      INGREDIENT: 'border-green-200 bg-green-50 text-green-700',
      SPICE: 'border-orange-200 bg-orange-50 text-orange-700',
      CONDIMENT: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      BEVERAGE: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      DAIRY: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      PRODUCE: 'border-lime-200 bg-lime-50 text-lime-700',
      PROTEIN: 'border-red-200 bg-red-50 text-red-700',
      GRAIN: 'border-amber-200 bg-amber-50 text-amber-700',
      OIL: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      PACKAGING: 'border-purple-200 bg-purple-50 text-purple-700',
      SUPPLY: 'border-gray-200 bg-gray-50 text-gray-700',
      EQUIPMENT: 'border-slate-200 bg-slate-50 text-slate-700',
      OTHER: 'border-gray-200 bg-gray-50 text-gray-700',
    };
    return colorMap[type] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeInfo = (type: TransactionType) => {
    switch (type) {
      case 'INITIAL':
        return {
          label: 'Initial Stock',
          color: 'border-blue-200 bg-blue-50 text-blue-700',
          icon: Package,
        };
      case 'RESTOCK':
        return {
          label: 'Restock',
          color: 'border-green-200 bg-green-50 text-green-700',
          icon: ArrowUpCircle,
        };
      case 'SALE':
        return {
          label: 'Sale',
          color: 'border-red-200 bg-red-50 text-red-700',
          icon: ArrowDownCircle,
        };
      default:
        return {
          label: type,
          color: 'border-gray-200 bg-gray-50 text-gray-700',
          icon: Clock,
        };
    }
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
        itemName: item.name || '',
        itemType: item.itemType || 'RAW_MATERIAL',
        quantity: Number(item.quantity),
        unit: item.unit || 'pcs',
        unitCost: Number(item.unitCost),
        supplier: item.supplier || '',
        purchaseDate: item.purchaseDate.split('T')[0],
        notes: item.notes || '',
      });
    } else {
      setEditMode(false);
      setSelectedItem(null);
      setItemForm({
        itemName: '',
        itemType: 'RAW_MATERIAL',
        quantity: 0,
        unit: 'pcs',
        unitCost: 0,
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
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

  const handleOpenRestockModal = (item: Purchase) => {
    setSelectedItem(item);
    setRestockQuantity(0);
    setRestockNotes('');
    setShowRestockModal(true);
  };

  const handleRestock = () => {
    if (!selectedItem || restockQuantity <= 0) return;

    restockMutation.mutate(
      {
        id: selectedItem.id,
        data: {
          quantity: restockQuantity,
          notes: restockNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowRestockModal(false);
          setRestockQuantity(0);
          setRestockNotes('');
        },
      }
    );
  };

  const handleCreatePeriod = () => {
    createPeriodMutation.mutate(periodForm, {
      onSuccess: (newPeriod) => {
        setShowPeriodModal(false);
        // Set the new period as active
        setActivePeriodMutation.mutate(newPeriod.id);
        setPeriodForm({
          periodName: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            .toISOString()
            .split('T')[0],
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
        <div className="flex flex-wrap gap-2">
          {/* Period Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-48 justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{activePeriod?.periodName || 'Select Period'}</span>
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

          <Link to="/dashboard/scan-receipt">
            <Button variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Scan Receipt
            </Button>
          </Link>

          <Button variant="green" onClick={() => handleOpenItemModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-xl font-semibold text-gray-900">{stockByItem.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border shadow-none ${lowStockItems.length > 0 ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-amber-100' : 'bg-orange-50'}`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-orange-500'}`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Alerts</p>
                <p
                  className={`text-xl font-semibold ${lowStockItems.length > 0 ? 'text-amber-900' : 'text-gray-900'}`}
                >
                  {lowStockItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">All Items</TabsTrigger>
            <TabsTrigger value="stock">Stock Summary</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
          </div>
        </div>

        {/* All Items Tab */}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500 mb-4 max-w-sm">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Add your first item to start tracking inventory.'}
                  </p>
                  {!searchQuery && (
                    <Button variant="green" onClick={() => handleOpenItemModal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-gray-500 font-medium pl-4">Item</TableHead>
                      <TableHead className="text-gray-500 font-medium">Type</TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">Qty</TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">
                        Unit Cost
                      </TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">Total</TableHead>
                      <TableHead className="text-gray-500 font-medium">Date</TableHead>
                      <TableHead className="text-right text-gray-500 font-medium pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((item) => (
                      <TableRow key={item.id} className="border-gray-100">
                        <TableCell className="font-medium text-gray-900 pl-4">
                          <div>
                            <span>{item.name || 'Unknown'}</span>
                            {item.supplier && (
                              <span className="block text-xs text-gray-400">{item.supplier}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getInventoryTypeColor(item.itemType || 'OTHER')}
                          >
                            {formatInventoryType(item.itemType || 'OTHER')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-900">{item.quantity}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => handleOpenRestockModal(item)}
                              title="Add Stock"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
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
              <CardDescription>Aggregated view of items in this period</CardDescription>
            </CardHeader>
            <CardContent>
              {stockByItem.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No items in this period</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Total Quantity</TableHead>
                      <TableHead className="text-right">Last Unit Cost</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockByItem.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
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

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="border shadow-none bg-white">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Track all inventory changes including restocks and sales deductions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={historyItemFilter} onValueChange={setHistoryItemFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Items</SelectItem>
                      {purchases.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={historyTypeFilter}
                    onValueChange={(v) => setHistoryTypeFilter(v as TransactionType | 'ALL')}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="INITIAL">Initial</SelectItem>
                      <SelectItem value="RESTOCK">Restock</SelectItem>
                      <SelectItem value="SALE">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <History className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-4 max-w-sm">
                    Add items or make sales to see transaction history here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-gray-500 font-medium pl-4">Date/Time</TableHead>
                      <TableHead className="text-gray-500 font-medium">Item</TableHead>
                      <TableHead className="text-gray-500 font-medium">Type</TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">Change</TableHead>
                      <TableHead className="text-right text-gray-500 font-medium">
                        Before → After
                      </TableHead>
                      <TableHead className="text-gray-500 font-medium pr-4">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const typeInfo = getTransactionTypeInfo(tx.type);
                      const TypeIcon = typeInfo.icon;
                      return (
                        <TableRow key={tx.id} className="border-gray-100">
                          <TableCell className="text-gray-600 pl-4">
                            {formatDateTime(tx.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {tx.purchase?.name || 'Unknown'}
                            <span className="ml-1 text-gray-400 text-sm">
                              ({tx.purchase?.unit || ''})
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${typeInfo.color} flex items-center gap-1 w-fit`}
                            >
                              <TypeIcon className="h-3 w-3" />
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-semibold ${
                                tx.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {tx.quantityChange >= 0 ? '+' : ''}
                              {Number(tx.quantityChange).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {Number(tx.quantityBefore).toFixed(2)} →{' '}
                            {Number(tx.quantityAfter).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-500 pr-4 max-w-32 truncate">
                            {tx.notes || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
            <DialogTitle>{editMode ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Update the item details below.'
                : "Add a new item. Choose 'Planned' to add to your shopping list."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={itemForm.itemName}
                onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
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
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={itemForm.supplier}
                  onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                  placeholder="e.g., Local Market"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <NumberInput
                  id="quantity"
                  value={itemForm.quantity || 0}
                  onChange={(value) =>
                    setItemForm({
                      ...itemForm,
                      quantity: value,
                    })
                  }
                  placeholder="0"
                  min={0}
                  allowDecimal={false}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={itemForm.unit || 'pcs'}
                  onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60">
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="L">Liter (L)</SelectItem>
                    <SelectItem value="mL">Milliliter (mL)</SelectItem>
                    <SelectItem value="gal">Gallon (gal)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="can">Can</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="sack">Sack</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="tray">Tray</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitCost">Unit Cost (₱) *</Label>
                <NumberInput
                  id="unitCost"
                  value={itemForm.unitCost || 0}
                  onChange={(value) =>
                    setItemForm({
                      ...itemForm,
                      unitCost: value,
                    })
                  }
                  placeholder="0.00"
                  min={0}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Date Purchased</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={itemForm.purchaseDate}
                  onChange={(e) => setItemForm({ ...itemForm, purchaseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={itemForm.notes}
                onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            {itemForm.quantity > 0 && itemForm.unitCost > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total:{' '}
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
                itemForm.quantity < 0 ||
                createPurchaseMutation.isPending ||
                updatePurchaseMutation.isPending
              }
            >
              {createPurchaseMutation.isPending || updatePurchaseMutation.isPending
                ? 'Saving...'
                : editMode
                  ? 'Save Changes'
                  : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Period Modal */}
      <Dialog open={showPeriodModal} onOpenChange={setShowPeriodModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Period</DialogTitle>
            <DialogDescription>Start a new inventory tracking period.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="periodName">Period Name *</Label>
              <Input
                id="periodName"
                value={periodForm.periodName}
                onChange={(e) => setPeriodForm({ ...periodForm, periodName: e.target.value })}
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
                  onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="periodEnd">End Date</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodForm.endDate}
                  onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
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
              disabled={!periodForm.periodName || createPeriodMutation.isPending}
            >
              {createPeriodMutation.isPending ? 'Creating...' : 'Create Period'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item from your inventory. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Stock Modal */}
      <Dialog open={showRestockModal} onOpenChange={setShowRestockModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>Add stock quantity for {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Stock</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">
                  {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restockQty">Quantity to Add *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setRestockQuantity((prev) => Math.max(0, prev - 1))}
                  disabled={restockQuantity <= 0}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <NumberInput
                  id="restockQty"
                  value={restockQuantity}
                  onChange={(value) => setRestockQuantity(Math.max(0, value))}
                  className="text-center"
                  placeholder="0"
                  min={0}
                  allowDecimal={false}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setRestockQuantity((prev) => prev + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restockNotes">Notes (optional)</Label>
              <Input
                id="restockNotes"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="e.g., Restocked from supplier"
              />
            </div>

            {restockQuantity > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  New Stock:{' '}
                  <span className="font-semibold">
                    {(Number(selectedItem?.quantity) || 0) + restockQuantity} {selectedItem?.unit}
                  </span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRestockModal(false);
                setRestockQuantity(0);
                setRestockNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={handleRestock}
              disabled={restockQuantity <= 0 || restockMutation.isPending}
            >
              {restockMutation.isPending
                ? 'Adding...'
                : `Add ${restockQuantity} ${selectedItem?.unit || 'units'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
