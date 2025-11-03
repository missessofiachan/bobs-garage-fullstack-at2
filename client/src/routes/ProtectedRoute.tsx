import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAppSelector } from '../hooks/hooks';
import type { RootState } from '../store/store';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAppSelector((s: RootState) => s.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
  const { accessToken, role } = useAppSelector((s: RootState) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
