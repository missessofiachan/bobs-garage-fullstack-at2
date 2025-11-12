// role helpers, token utils

/**
 * Extracts the user role from a JWT token
 *
 * @param token - The JWT token string
 * @returns The user role ('user' or 'admin') or null if token is invalid
 */
export function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 *
 * @param token - The JWT token string
 * @returns True if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
