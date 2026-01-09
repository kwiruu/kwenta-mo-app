import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type Business, type UserProfile, type UpdateBusinessDto } from '~/lib/api';
import { useAuthStore } from '~/stores/authStore';

// Query keys for cache management
export const businessKeys = {
  all: ['business'] as const,
  profile: () => [...businessKeys.all, 'profile'] as const,
};

// Fetch user profile with business
export function useUserProfile() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  return useQuery({
    queryKey: businessKeys.profile(),
    queryFn: () => usersApi.getProfile(),
    enabled: isAuthenticated && !isAuthLoading,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update business mutation
export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessDto) => usersApi.updateBusiness(data),
    onSuccess: (updatedBusiness) => {
      // Update the profile cache with new business data
      queryClient.setQueryData(businessKeys.profile(), (old: UserProfile | undefined) => {
        if (!old) return old;
        return {
          ...old,
          business: updatedBusiness,
        };
      });
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: businessKeys.profile() });
    },
  });
}
