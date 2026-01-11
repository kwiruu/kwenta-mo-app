import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '~/lib/supabase';
import { useAuthStore } from '~/stores/authStore';

/**
 * Session Manager Hook
 * 
 * Handles automatic session refresh when:
 * 1. User returns to the app after being away (tab focus)
 * 2. User opens laptop after sleep/hibernate
 * 3. Session is about to expire
 * 
 * This ensures the user doesn't get "token expired" errors
 * after leaving the app idle for extended periods.
 */
export function useSessionManager() {
  const { isAuthenticated, signOut } = useAuthStore();
  const lastFocusRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  // Refresh session - called when user returns to app
  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      
      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('Session refresh failed:', error.message);
        
        // If refresh fails, the session is truly expired
        // Check if we can still get a valid session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // No valid session - user needs to log in again
          console.log('Session expired, signing out...');
          await signOut();
          
          // Redirect to login page
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
        return;
      }

      if (data.session) {
        console.log('Session refreshed successfully');
        // The auth store will be updated via onAuthStateChange
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [signOut]);

  // Handle visibility change (tab focus/unfocus)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceLastFocus = now - lastFocusRef.current;
        
        // If more than 5 minutes have passed since last focus, refresh session
        const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
        
        if (timeSinceLastFocus > REFRESH_THRESHOLD) {
          console.log(`Tab focused after ${Math.round(timeSinceLastFocus / 1000 / 60)} minutes, refreshing session...`);
          refreshSession();
        }
        
        lastFocusRef.current = now;
      }
    };

    // Handle window focus (for when switching between windows)
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusRef.current;
      const REFRESH_THRESHOLD = 5 * 60 * 1000;
      
      if (timeSinceLastFocus > REFRESH_THRESHOLD) {
        console.log(`Window focused after ${Math.round(timeSinceLastFocus / 1000 / 60)} minutes, refreshing session...`);
        refreshSession();
      }
      
      lastFocusRef.current = now;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also set up periodic check (every 10 minutes) to refresh if needed
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshSession]);

  // On mount, refresh session if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to let the app initialize first
      const timeoutId = setTimeout(() => {
        refreshSession();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, refreshSession]);

  return { refreshSession };
}
