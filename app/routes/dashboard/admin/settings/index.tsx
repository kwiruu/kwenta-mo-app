import { useState } from 'react';
import { Settings, Brain, Trash2, AlertTriangle, RefreshCcw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { useToast } from '~/hooks/use-toast';
import { useAdminCategoryMemory, useDeleteCategoryMemory } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Settings - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Admin settings and configuration' },
  ];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const inventoryTypeLabels: Record<string, string> = {
  MEAT: 'Meat',
  POULTRY: 'Poultry',
  SEAFOOD: 'Seafood',
  VEGETABLE: 'Vegetables',
  FRUIT: 'Fruits',
  DAIRY: 'Dairy',
  DRY_GOODS: 'Dry Goods',
  BEVERAGE: 'Beverages',
  CONDIMENT: 'Condiments',
  SPICE: 'Spices',
  OIL: 'Oils',
  FROZEN: 'Frozen',
  PACKAGING: 'Packaging',
  OTHER: 'Other',
};

const inventoryTypeColors: Record<string, string> = {
  MEAT: 'bg-red-100 text-red-700',
  POULTRY: 'bg-orange-100 text-orange-700',
  SEAFOOD: 'bg-blue-100 text-blue-700',
  VEGETABLE: 'bg-green-100 text-green-700',
  FRUIT: 'bg-yellow-100 text-yellow-700',
  DAIRY: 'bg-cyan-100 text-cyan-700',
  DRY_GOODS: 'bg-amber-100 text-amber-700',
  BEVERAGE: 'bg-purple-100 text-purple-700',
  CONDIMENT: 'bg-pink-100 text-pink-700',
  SPICE: 'bg-rose-100 text-rose-700',
  OIL: 'bg-lime-100 text-lime-700',
  FROZEN: 'bg-sky-100 text-sky-700',
  PACKAGING: 'bg-gray-100 text-gray-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: memoryData, isLoading, refetch } = useAdminCategoryMemory();
  const deleteMutation = useDeleteCategoryMemory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Pattern deleted',
        description: 'The category memory pattern has been removed.',
      });
      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete the pattern.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and AI learning</p>
      </div>

      {/* Category Memory Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Category Memory (AI Learning)
              </CardTitle>
              <CardDescription>
                These are learned patterns from receipt scanning. The system remembers item names
                and their categories for faster categorization.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {memoryData && memoryData.patterns && memoryData.patterns.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b text-sm text-muted-foreground">
                    <span>{memoryData.patterns.length} patterns learned</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Clear All Category Memory?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete all learned patterns. The system will need to re-learn
                            item categories from future receipt scans. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={async () => {
                              // Delete all - we'd need a bulk delete endpoint
                              // For now, just show a message
                              toast({
                                title: 'Coming soon',
                                description: 'Bulk delete will be available in a future update.',
                              });
                            }}
                          >
                            Clear All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="grid gap-2">
                    {memoryData.patterns.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              inventoryTypeColors[item.category] || 'bg-gray-100 text-gray-700'
                            }
                          >
                            {inventoryTypeLabels[item.category] || item.category}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.itemPattern}</p>
                            <p className="text-xs text-muted-foreground">
                              Learned on {formatDate(item.createdAt)} · Used {item.useCount} times
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-600"
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Pattern?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove the learned association between "{item.itemPattern}" and "
                                {inventoryTypeLabels[item.category] || item.category}". The system
                                may re-learn this pattern from future scans.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No category patterns learned yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Patterns are automatically learned when items are scanned from receipts
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground">Application</p>
              <p className="font-medium">{APP_CONFIG.name}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground">Environment</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Production</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground">Receipt Scanner</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Connected</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground">Database</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">PostgreSQL</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
