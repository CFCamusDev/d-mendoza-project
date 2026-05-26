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
import { ProtectedRoute } from '../features/admin/components/ProtectedRoute';
import ProfilePage from '../features/ecommerce/profile/ProfilePage';
import CategoriesPage from '../features/admin/CategoriesPage';
import BrandsPage from '../features/admin/BrandsPage';
import AttributesPage from '../features/admin/AttributesPage';
import ProductFormPage from '../features/admin/ProductFormPage';
import AdjustmentPage from '../features/admin/AdjustmentPage';
import RotationReportPage from '../features/admin/RotationReportPage';

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

      {/* HU-011 */}
      <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><CategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/brands" element={<ProtectedRoute allowedRoles={['ADMIN']}><BrandsPage /></ProtectedRoute>} />

      {/* HU-012 */}
      <Route path="/admin/attributes" element={<ProtectedRoute allowedRoles={['ADMIN']}><AttributesPage /></ProtectedRoute>} />

      {/* HU-013 */}
      <Route path="/admin/products/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProductFormPage /></ProtectedRoute>} />
      <Route path="/admin/products/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProductFormPage /></ProtectedRoute>} />

      {/* HU-028 */}
      <Route path="/admin/inventory/adjustments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdjustmentPage /></ProtectedRoute>} />

      {/* HU-030 */}
      <Route path="/admin/reports/inventory-rotation" element={<ProtectedRoute allowedRoles={['ADMIN']}><RotationReportPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
