import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAppSelector } from '../app/hooks';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAppSelector(s => s.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
  const { accessToken, role } = useAppSelector(s => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
