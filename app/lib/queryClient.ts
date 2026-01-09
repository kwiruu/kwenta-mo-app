import { QueryClient } from '@tanstack/react-query';

// Create a QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry once on error
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Timeout for network requests (handled in api.ts, but this prevents indefinite pending)
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
      // Ensure mutations don't hang
      networkMode: 'offlineFirst',
    },
  },
});
