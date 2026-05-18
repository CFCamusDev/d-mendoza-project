import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import type { UserRole } from '@/shared/types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Validate session presence
  if (!isAuthenticated) {
    // Redirect to login but store current location to safely bring user back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Validate specific authorization vector (RBAC)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Valid user detected but lacking dynamic privileges for requested route
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Validation pipeline clear - render child resource
  return <>{children}</>;
};
