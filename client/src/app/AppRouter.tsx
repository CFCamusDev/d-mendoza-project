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
import BranchesPage from '../features/admin/branches/BranchesPage';
import BrandingPage from '../features/admin/BrandingPage';
import ClientLinkPage from '../features/admin/ClientLinkPage';
import BannersPage from '../features/admin/BannersPage';
import ProductsAdminPage from '../features/admin/ProductsAdminPage';
import { ProtectedRoute } from '../features/admin/components/ProtectedRoute';
import ProfilePage from '../features/ecommerce/profile/ProfilePage';
import { AppShell } from '../components/layout/AppShell';
import { AdminShell } from '../components/layout/AdminShell';
import { PosShell } from '../components/layout/PosShell';
import CategoriesPage from '../features/admin/CategoriesPage';
import BrandsPage from '../features/admin/BrandsPage';
import AttributesPage from '../features/admin/AttributesPage';
import ProductFormPage from '../features/admin/ProductFormPage';
import AdjustmentPage from '../features/admin/AdjustmentPage';
import RotationReportPage from '../features/admin/RotationReportPage';
import SuppliersPage from '../features/admin/suppliers/SuppliersPage';
import StockEntriesPage from '../features/admin/entries/StockEntriesPage';
import StockPage from '../features/admin/stock/StockPage';
import InventoryAuditPage from '../features/admin/audits/InventoryAuditPage';
import { PosProvider, PosGuard } from '../features/pos/context/PosContext';
import OpenCashPage from '../features/pos/OpenCashPage';
import CashRegistersPage from '../features/admin/branches/CashRegistersPage';
import PossScreen from '../features/pos/PossScreen';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public / E-commerce Routes (wrapped in AppShell) */}
      <Route element={<AppShell />}>
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

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SELLER', 'CLIENT']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* POS Routes with Cash Register Opening Shift verification (standalone container) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
            <PosProvider>
              <PosShell />
            </PosProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/pos/open-cash" element={<OpenCashPage />} />
        <Route
          path="/pos"
          element={
            <PosGuard>
              <PossScreen />
            </PosGuard>
          }
        />
      </Route>

      {/* Administrative Routes (wrapped in AdminShell) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}><AdminShell /></ProtectedRoute>}>
        <Route
          path="/admin"
          element={<Navigate to="/admin/inventory/stock" replace />}
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
          path="/admin/branding"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BrandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BannersPage />
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
          path="/admin/branches"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BranchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/branches/registers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CashRegistersPage />
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

        {/* HU-051 */}
        <Route path="/admin/inventory/suppliers" element={<ProtectedRoute allowedRoles={['ADMIN']}><SuppliersPage /></ProtectedRoute>} />
        <Route path="/admin/inventory/entries" element={<ProtectedRoute allowedRoles={['ADMIN']}><StockEntriesPage /></ProtectedRoute>} />

        {/* HU-021 */}
        <Route path="/admin/inventory/stock" element={<ProtectedRoute allowedRoles={['ADMIN']}><StockPage /></ProtectedRoute>} />

        {/* HU-029 */}
        <Route path="/admin/inventory/audits" element={<ProtectedRoute allowedRoles={['ADMIN']}><InventoryAuditPage /></ProtectedRoute>} />

        {/* HU-030 */}
        <Route path="/admin/reports/inventory-rotation" element={<ProtectedRoute allowedRoles={['ADMIN']}><RotationReportPage /></ProtectedRoute>} />

        {/* User Profile */}
        <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}><ProfilePage /></ProtectedRoute>} />
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
