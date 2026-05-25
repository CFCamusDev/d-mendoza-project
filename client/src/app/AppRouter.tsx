import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../features/ecommerce/auth/RegisterPage';
import VerifyPage from '../features/ecommerce/auth/VerifyPage';
import LoginPage from '../features/ecommerce/auth/LoginPage';
import ForgotPasswordPage from '../features/ecommerce/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/ecommerce/auth/ResetPasswordPage';
import GoogleAuthSuccessPage from '../features/ecommerce/auth/GoogleAuthSuccessPage';
import HomePage from '../features/ecommerce/HomePage';
import UnauthorizedPage from '../features/admin/UnauthorizedPage';
import EmployeesPage from '../features/admin/EmployeesPage';
import ClientLinkPage from '../features/admin/ClientLinkPage';
import ProductsAdminPage from '../features/admin/ProductsAdminPage';
import { ProtectedRoute } from '../features/admin/components/ProtectedRoute';
import ProfilePage from '../features/ecommerce/profile/ProfilePage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Main Entry Point */}
      <Route path="/" element={<HomePage />} />

      {/* Public / Unprotected Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Google OAuth Success Redirect (HU-001 / T-036) */}
      <Route path="/auth/google/success" element={<GoogleAuthSuccessPage />} />
      
      {/* Restricted Routes (Protected by RBAC) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/employees" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EmployeesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/clients/link" 
        element={
          <ProtectedRoute allowedPermissions={['users:write']}>
            <ClientLinkPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ProductsAdminPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pos" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SELLER', 'CLIENT']}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
