import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  usersApi,
  ApiError,
  type Business,
  type UserProfile,
  type UpdateBusinessDto,
} from '~/lib/api';

interface BusinessState {
  profile: UserProfile | null;
  business: Business | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<UserProfile | null>;
  updateBusiness: (data: UpdateBusinessDto) => Promise<Business | null>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  devtools(
    (set, get) => ({
      profile: null,
      business: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const profile = await usersApi.getProfile();
          set({
            profile,
            business: profile.business || null,
            isLoading: false,
          });
          return profile;
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Failed to fetch profile';
          set({ error: message, isLoading: false });
          return null;
        }
      },

      updateBusiness: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const business = await usersApi.updateBusiness(data);
          set({ business, isLoading: false });
          return business;
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Failed to update business';
          set({ error: message, isLoading: false });
          return null;
        }
      },
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'BusinessStore' }
  )
);
