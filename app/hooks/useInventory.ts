import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  inventoryApi,
  type CreateInventoryPeriodDto,
  type CreateInventorySnapshotDto,
} from '~/lib/api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  periods: () => [...inventoryKeys.all, 'periods'] as const,
  period: (id: string) => [...inventoryKeys.periods(), id] as const,
  periodSummary: (id: string) => [...inventoryKeys.periods(), id, 'summary'] as const,
  latestPeriod: () => [...inventoryKeys.periods(), 'latest'] as const,
  activePeriod: () => [...inventoryKeys.periods(), 'active'] as const,
  snapshots: (periodId: string) => [...inventoryKeys.all, 'snapshots', periodId] as const,
  snapshot: (id: string) => [...inventoryKeys.all, 'snapshot', id] as const,
};

// ==================== PERIODS ====================

export function useInventoryPeriods() {
  return useQuery({
    queryKey: inventoryKeys.periods(),
    queryFn: () => inventoryApi.getAllPeriods(),
  });
}

export function useActivePeriod() {
  return useQuery({
    queryKey: inventoryKeys.activePeriod(),
    queryFn: () => inventoryApi.getActivePeriod(),
  });
}

export function useSetActivePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.setActivePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.activePeriod() });
    },
  });
}

export function useInventoryPeriod(id: string) {
  return useQuery({
    queryKey: inventoryKeys.period(id),
    queryFn: () => inventoryApi.getPeriodById(id),
    enabled: !!id,
  });
}

export function useLatestInventoryPeriod() {
  return useQuery({
    queryKey: inventoryKeys.latestPeriod(),
    queryFn: () => inventoryApi.getLatestPeriod(),
  });
}

export function useInventoryPeriodSummary(id: string) {
  return useQuery({
    queryKey: inventoryKeys.periodSummary(id),
    queryFn: () => inventoryApi.getPeriodSummary(id),
    enabled: !!id,
  });
}

export function useCreateInventoryPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryPeriodDto) => inventoryApi.createPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.periods() });
    },
  });
}

export function useUpdateInventoryPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInventoryPeriodDto> }) =>
      inventoryApi.updatePeriod(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.period(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.periods() });
    },
  });
}

export function useDeleteInventoryPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deletePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.periods() });
    },
  });
}

// ==================== SNAPSHOTS ====================

export function useInventorySnapshots(periodId: string) {
  return useQuery({
    queryKey: inventoryKeys.snapshots(periodId),
    queryFn: () => inventoryApi.getSnapshots(periodId),
    enabled: !!periodId,
  });
}

export function useInventorySnapshot(id: string) {
  return useQuery({
    queryKey: inventoryKeys.snapshot(id),
    queryFn: () => inventoryApi.getSnapshotById(id),
    enabled: !!id,
  });
}

export function useCreateInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventorySnapshotDto) => inventoryApi.createSnapshot(data),
    onSuccess: (_, { periodId }) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.snapshots(periodId),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.periodSummary(periodId),
      });
    },
  });
}

export function useCreateBulkInventorySnapshots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (snapshots: CreateInventorySnapshotDto[]) =>
      inventoryApi.createBulkSnapshots(snapshots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdateInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInventorySnapshotDto> }) =>
      inventoryApi.updateSnapshot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useDeleteInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteSnapshot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

// ==================== HELPERS ====================

export function useCopyFromPurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodId,
      snapshotType,
    }: {
      periodId: string;
      snapshotType: 'BEGINNING' | 'ENDING';
    }) => inventoryApi.copyFromPurchases(periodId, snapshotType),
    onSuccess: (_, { periodId }) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.snapshots(periodId),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.periodSummary(periodId),
      });
    },
  });
}

// Legacy aliases for backwards compatibility
export const useCopyFromInventoryItems = useCopyFromPurchases;
export const useCopyFromIngredients = useCopyFromPurchases;
