import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

/**
 * Protected route component that requires authentication
 * Redirects to login if user is not authenticated or token is expired
 *
 * @param children - The child components to render if authenticated
 * @returns The children if authenticated, or redirects to login
 */
export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { token, isChecking, isTokenExpired } = useTokenRefresh();

  if (isChecking) {
    // Show loading state while checking token
    return <div>Loading...</div>;
  }

  if (!token || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Admin-only route component that requires authentication and admin role
 * Redirects to login if not authenticated, or to home if not admin
 *
 * @param children - The child components to render if user is admin
 * @returns The children if user is admin, or redirects appropriately
 */
export function AdminRoute({ children }: { children: ReactElement }) {
  const { token, isChecking, isTokenExpired } = useTokenRefresh();
  const role = useAppSelector((s) => s.auth.role);

  if (isChecking) {
    // Show loading state while checking token
    return <div>Loading...</div>;
  }

  if (!token || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
