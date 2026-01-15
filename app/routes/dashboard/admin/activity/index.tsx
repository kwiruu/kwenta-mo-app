import { useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  Receipt,
  UtensilsCrossed,
  User,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useAdminAuditLog } from '~/hooks';
import { APP_CONFIG } from '~/config/app';

export function meta() {
  return [
    { title: `Activity Log - ${APP_CONFIG.name}` },
    { name: 'description', content: 'View all system activity' },
  ];
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionIcon(action: string) {
  if (action.includes('purchase') || action.includes('inventory')) {
    return <Package className="h-4 w-4" />;
  }
  if (action.includes('sale')) {
    return <ShoppingCart className="h-4 w-4" />;
  }
  if (action.includes('expense')) {
    return <Receipt className="h-4 w-4" />;
  }
  if (action.includes('recipe')) {
    return <UtensilsCrossed className="h-4 w-4" />;
  }
  if (action.includes('user')) {
    return <User className="h-4 w-4" />;
  }
  return <Activity className="h-4 w-4" />;
}

function getActionColor(action: string) {
  if (action.includes('create') || action.includes('add')) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (action.includes('update') || action.includes('edit')) {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  if (action.includes('delete') || action.includes('remove')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

const activityTypes = [
  { value: 'all', label: 'All Activities' },
  { value: 'purchase', label: 'Inventory' },
  { value: 'sale', label: 'Sales' },
  { value: 'expense', label: 'Expenses' },
  { value: 'recipe', label: 'Recipes' },
];

export default function AdminActivity() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const limit = 20;

  const { data: auditData, isLoading } = useAdminAuditLog(
    page,
    limit,
    typeFilter === 'all' ? undefined : typeFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-muted-foreground">Complete audit trail of all system actions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {auditData?.pagination.total ?? 0} activities recorded
              </CardDescription>
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {auditData?.logs.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">by {activity.user}</p>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span title={formatFullDate(activity.createdAt)}>
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!auditData?.logs || auditData.logs.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity recorded yet</p>
                  </div>
                )}
              </div>

              {auditData && auditData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {auditData.pagination.page} of {auditData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= auditData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
