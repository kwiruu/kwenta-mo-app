import { QueryClient } from '@tanstack/react-query';

// Create a QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Refetch when components remount if data is stale (default behavior)
      refetchOnMount: true,
      // Don't refetch just because network reconnects
      refetchOnReconnect: false,
      // Retry once on error
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});
