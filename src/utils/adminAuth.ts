/**
 * Admin Authentication Utilities
 * Handles localStorage and sessionStorage authentication
 */

export interface AdminUser {
  username: string;
  role: string;
  token: string;
}

/**
 * Get the admin user from either localStorage or sessionStorage
 * Returns null if no user is found
 */
export const getAdminUser = (): AdminUser | null => {
  try {
    // Check localStorage first (remember me)
    const localStorageUser = localStorage.getItem('adminUser');
    if (localStorageUser) {
      return JSON.parse(localStorageUser);
    }

    // Check sessionStorage (temporary session)
    const sessionStorageUser = sessionStorage.getItem('adminUser');
    if (sessionStorageUser) {
      return JSON.parse(sessionStorageUser);
    }

    return null;
  } catch (error) {
    console.error('Error parsing admin user:', error);
    return null;
  }
};

/**
 * Remove admin user from both localStorage and sessionStorage
 */
export const clearAdminUser = (): void => {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('adminRememberMe');
  sessionStorage.removeItem('adminUser');
};

/**
 * Check if the user has "remember me" enabled
 */
export const hasRememberMe = (): boolean => {
  return localStorage.getItem('adminRememberMe') === 'true';
};

