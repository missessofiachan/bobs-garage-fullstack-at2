export type JwtPayload = {
  sub?: number | string;
  role?: 'user' | 'admin';
  email?: string;
  exp?: number;
  iat?: number;
  [k: string]: unknown;
};

// Lightweight, no-deps JWT payload decode (no signature verification)
export function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
