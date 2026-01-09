import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { usersApi, ApiError } from '~/lib/api';

interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  laborCostPercentage: number;
  overheadPercentage: number;
  defaultProfitMargin: number;
}

interface UserProfile {
  id: string;
  supabaseUserId: string;
  email: string;
  name?: string;
  business?: Business;
}

interface CurrentBusiness {
  id: string;
  name: string;
  type?: string;
  location?: string;
  employeeCount?: number;
  avgMonthlySales?: number;
  rawMaterialSource?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusinessState {
  profile: UserProfile | null;
  business: Business | null;
  currentBusiness: CurrentBusiness | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<UserProfile | null>;
  updateBusiness: (data: {
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    laborCostPercentage?: number;
    overheadPercentage?: number;
    defaultProfitMargin?: number;
  }) => Promise<Business | null>;
  setCurrentBusiness: (business: CurrentBusiness) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  devtools(
    (set, get) => ({
      profile: null,
      business: null,
      currentBusiness: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const profile = (await usersApi.getProfile()) as UserProfile;
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
          const business = (await usersApi.updateBusiness(data)) as Business;
          set({ business, isLoading: false });
          return business;
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Failed to update business';
          set({ error: message, isLoading: false });
          return null;
        }
      },

      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'BusinessStore' }
  )
);
