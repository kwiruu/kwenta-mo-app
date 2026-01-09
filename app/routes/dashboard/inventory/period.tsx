import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Warehouse,
  Plus,
  Trash2,
  Package,
  Calendar,
  Save,
  Copy,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  useInventoryPeriod,
  useCreateInventorySnapshot,
  useDeleteInventorySnapshot,
  useCopyFromIngredients,
  useIngredients,
} from '~/hooks';
import { APP_CONFIG } from '~/config/app';
import type { InventoryType } from '~/lib/api';

export function meta() {
  return [
    { title: `Inventory Period - ${APP_CONFIG.name}` },
    { name: 'description', content: 'View inventory period details' },
  ];
}

export default function InventoryPeriodDetailPage() {
  const { id } = useParams();
  const { data: period, isLoading } = useInventoryPeriod(id!);
  const { data: ingredients = [] } = useIngredients();
  const createSnapshotMutation = useCreateInventorySnapshot();
  const deleteSnapshotMutation = useDeleteInventorySnapshot();
  const copyFromIngredientsMutation = useCopyFromIngredients();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snapshotType, setSnapshotType] = useState<'beginning' | 'ending'>('beginning');
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyToType, setCopyToType] = useState<'beginning' | 'ending'>('beginning');

  const [newSnapshot, setNewSnapshot] = useState({
    ingredientId: '',
    itemName: '',
    itemType: 'RAW_MATERIAL' as InventoryType,
    quantity: '',
    unitCost: '',
  });

  const handleAddSnapshot = () => {
    if (!id) return;

    createSnapshotMutation.mutate(
      {
        periodId: id,
        purchaseId: newSnapshot.ingredientId || undefined,
        itemName: newSnapshot.itemName,
        itemType: newSnapshot.itemType,
        quantity: parseFloat(newSnapshot.quantity),
        unitCost: parseFloat(newSnapshot.unitCost),
        snapshotType: snapshotType === 'beginning' ? 'BEGINNING' : 'ENDING',
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setNewSnapshot({
            ingredientId: '',
            itemName: '',
            itemType: 'RAW_MATERIAL',
            quantity: '',
            unitCost: '',
          });
        },
      }
    );
  };

  const handleDeleteSnapshot = () => {
    if (!deleteId) return;

    deleteSnapshotMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleCopyIngredients = () => {
    if (!id) return;

    copyFromIngredientsMutation.mutate(
      {
        periodId: id,
        snapshotType: copyToType === 'beginning' ? 'BEGINNING' : 'ENDING',
      },
      {
        onSuccess: () => setShowCopyDialog(false),
      }
    );
  };

  const handleIngredientSelect = (ingredientId: string) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    if (ingredient) {
      setNewSnapshot({
        ...newSnapshot,
        ingredientId,
        itemName: ingredient.name,
        unitCost: ingredient.costPerUnit.toString(),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Period not found</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/inventory">Go Back</Link>
        </Button>
      </div>
    );
  }

  const allSnapshots = period.snapshots || [];
  const beginningSnapshots = allSnapshots.filter((s) => s.snapshotType === 'BEGINNING');
  const endingSnapshots = allSnapshots.filter((s) => s.snapshotType === 'ENDING');

  const beginningTotal = beginningSnapshots.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
  const endingTotal = endingSnapshots.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
  const inventoryChange = endingTotal - beginningTotal;

  const renderSnapshotTable = (snapshots: any[], type: 'beginning' | 'ending') => (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-gray-500">Item</TableHead>
          <TableHead className="text-gray-500">Type</TableHead>
          <TableHead className="text-gray-500">Quantity</TableHead>
          <TableHead className="text-gray-500">Unit Cost</TableHead>
          <TableHead className="text-gray-500">Total</TableHead>
          <TableHead className="text-gray-500 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {snapshots.map((snapshot: any) => (
          <TableRow key={snapshot.id} className="border-gray-100 hover:bg-gray-50">
            <TableCell className="font-medium text-gray-900">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                {snapshot.itemName}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  snapshot.itemType === 'RAW_MATERIAL'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }
              >
                {snapshot.itemType === 'RAW_MATERIAL' ? 'Raw Material' : 'Packaging'}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600">{snapshot.quantity}</TableCell>
            <TableCell className="text-gray-600">{formatCurrency(snapshot.unitCost)}</TableCell>
            <TableCell className="font-medium text-gray-900">
              {formatCurrency(snapshot.quantity * snapshot.unitCost)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteId(snapshot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {snapshots.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No {type} inventory snapshots yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="-ml-2 text-gray-600 hover:text-gray-900">
        <Link to="/dashboard/inventory">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{period.periodName}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCopyDialog(true)}
          disabled={ingredients.length === 0}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy from Ingredients
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Beginning Inventory</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(beginningTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ending Inventory</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(endingTotal)}
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
                  inventoryChange >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <DollarSign
                  className={`h-5 w-5 ${inventoryChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventory Change</p>
                <p
                  className={`text-2xl font-semibold ${
                    inventoryChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {inventoryChange >= 0 ? '+' : ''}
                  {formatCurrency(inventoryChange)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Tabs */}
      <Tabs defaultValue="beginning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="beginning" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Beginning ({beginningSnapshots.length})
          </TabsTrigger>
          <TabsTrigger value="ending" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Ending ({endingSnapshots.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beginning">
          <Card className="border shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Beginning Inventory</CardTitle>
                <CardDescription className="text-gray-500">
                  Inventory at the start of the period
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSnapshotType('beginning');
                  setShowAddDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {renderSnapshotTable(beginningSnapshots, 'beginning')}
              {beginningSnapshots.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(beginningTotal)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ending">
          <Card className="border shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Ending Inventory</CardTitle>
                <CardDescription className="text-gray-500">
                  Inventory at the end of the period
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSnapshotType('ending');
                  setShowAddDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {renderSnapshotTable(endingSnapshots, 'ending')}
              {endingSnapshots.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(endingTotal)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Snapshot Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {snapshotType === 'beginning' ? 'Beginning' : 'Ending'} Inventory Item
            </DialogTitle>
            <DialogDescription>
              Add an item to the {snapshotType} inventory snapshot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Link to Ingredient */}
            <div className="space-y-2">
              <Label htmlFor="ingredient">Link to Ingredient (Optional)</Label>
              <Select value={newSnapshot.ingredientId} onValueChange={handleIngredientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="e.g., Flour"
                value={newSnapshot.itemName}
                onChange={(e) => setNewSnapshot({ ...newSnapshot, itemName: e.target.value })}
              />
            </div>

            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type *</Label>
              <Select
                value={newSnapshot.itemType}
                onValueChange={(value) =>
                  setNewSnapshot({
                    ...newSnapshot,
                    itemType: value as InventoryType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                  <SelectItem value="PACKAGING">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Unit Cost */}
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 10"
                  value={newSnapshot.quantity}
                  onChange={(e) => setNewSnapshot({ ...newSnapshot, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₱) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 50"
                  value={newSnapshot.unitCost}
                  onChange={(e) => setNewSnapshot({ ...newSnapshot, unitCost: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSnapshot}
              disabled={
                !newSnapshot.itemName ||
                !newSnapshot.quantity ||
                !newSnapshot.unitCost ||
                createSnapshotMutation.isPending
              }
            >
              {createSnapshotMutation.isPending ? (
                'Adding...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Ingredients Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy from Ingredients</DialogTitle>
            <DialogDescription>
              Copy all your ingredients as inventory snapshots. This will help you quickly set up
              your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="copyTo">Copy to</Label>
              <Select
                value={copyToType}
                onValueChange={(value: 'beginning' | 'ending') => setCopyToType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginning">Beginning Inventory</SelectItem>
                  <SelectItem value="ending">Ending Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This will create {ingredients.length} inventory snapshot(s) from your ingredients
                list. You can edit the quantities afterwards.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCopyIngredients}
              disabled={copyFromIngredientsMutation.isPending}
            >
              {copyFromIngredientsMutation.isPending ? (
                'Copying...'
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Ingredients
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSnapshot}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteSnapshotMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
