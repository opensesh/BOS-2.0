/**
 * Simple client-side admin authentication for Inspo Table
 * Uses sessionStorage to persist admin mode during the session
 */

const ADMIN_KEY = 'inspo_admin_mode';
const ADMIN_PASSWORD_ENV = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

/**
 * Check if admin mode is currently active
 */
export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

/**
 * Enable or disable admin mode
 */
export function setAdminMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  if (enabled) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_KEY);
  }
}

/**
 * Validate admin password
 */
export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD_ENV;
}

