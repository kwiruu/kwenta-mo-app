import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  signInWithGoogle as supabaseSignInWithGoogle,
  getSession,
} from "~/lib/supabase";
import { authApi } from "~/lib/api";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; message?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true });

          const { session, error } = await getSession();

          if (error) {
            console.error("Session error:", error);
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          if (session) {
            set({
              user: session.user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sync user with backend
            try {
              await authApi.syncUser(session.user.user_metadata?.name);
            } catch (syncError) {
              console.warn("Failed to sync user with backend:", syncError);
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
              set({
                user: session.user,
                session,
                isAuthenticated: true,
              });

              // Sync with backend on sign in
              try {
                await authApi.syncUser(session.user.user_metadata?.name);
              } catch (syncError) {
                console.warn("Failed to sync user with backend:", syncError);
              }
            } else if (event === "SIGNED_OUT") {
              set({ user: null, session: null, isAuthenticated: false });
            } else if (event === "TOKEN_REFRESHED" && session) {
              set({ session });
            }
          });
        } catch (error) {
          console.error("Initialize error:", error);
          set({ isLoading: false, error: "Failed to initialize auth" });
        }
      },

      signUp: async (email, password, name) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabaseSignUp(email, password, name);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          set({ isLoading: false });

          // If email confirmation is required
          if (data.user && !data.session) {
            return {
              success: true,
              message: "Please check your email to confirm your account.",
            };
          }

          // If session exists (email confirmation disabled)
          if (data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
            });

            // Sync with backend
            try {
              await authApi.syncUser(name);
            } catch (syncError) {
              console.warn("Failed to sync user with backend:", syncError);
            }
          }

          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Sign up failed";
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabaseSignIn(email, password);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          if (data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sync with backend
            try {
              await authApi.syncUser(data.user?.user_metadata?.name);
            } catch (syncError) {
              console.warn("Failed to sync user with backend:", syncError);
            }

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, message: "Sign in failed" };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Sign in failed";
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabaseSignInWithGoogle();

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          // The redirect will happen, so we don't need to update state here
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Google sign in failed";
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      signOut: async () => {
        try {
          await supabaseSignOut();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Sign out error:", error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Don't persist sensitive data - rely on Supabase session
      }),
    }
  )
);
