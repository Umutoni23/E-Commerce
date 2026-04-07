import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

export function UserRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userRole !== 'ADMIN') return <Navigate to="/" />;

  return <>{children}</>;
}