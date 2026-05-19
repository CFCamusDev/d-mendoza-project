import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import type { UserRole } from '@/shared/types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isHydrating } = useAuth();
  const location = useLocation();

  // 1. Wait for session hydration from localStorage
  if (isHydrating) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-brand-accent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-brand-text animate-pulse">Cargando...</span>
        </div>
      </div>
    );
  }

  // 2. Validate session presence
  if (!isAuthenticated) {
    // Redirect to login but store current location to safely bring user back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Validate specific authorization vector (RBAC)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Valid user detected but lacking dynamic privileges for requested route
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Validation pipeline clear - render child resource
  return <>{children}</>;
};
