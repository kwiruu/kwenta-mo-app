import { useSessionManager } from '~/hooks/useSessionManager';

/**
 * SessionManager Component
 *
 * This invisible component manages the user's session lifecycle.
 * It handles automatic token refresh when:
 * - User returns to the app after being away
 * - User opens laptop after sleep/hibernate
 * - Session is about to expire
 *
 * Place this in the root app component.
 */
export function SessionManager() {
  useSessionManager();
  return null;
}
