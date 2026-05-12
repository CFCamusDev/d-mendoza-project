import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../features/ecommerce/auth/RegisterPage';
import VerifyPage from '../features/ecommerce/auth/VerifyPage';
import LoginPage from '../features/ecommerce/auth/LoginPage';
import ForgotPasswordPage from '../features/ecommerce/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/ecommerce/auth/ResetPasswordPage';
import GoogleAuthSuccessPage from '../features/ecommerce/auth/GoogleAuthSuccessPage';
import HomePage from '../features/ecommerce/HomePage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Main Entry Point */}
      <Route path="/" element={<HomePage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Google OAuth Success Redirect (HU-001 / T-036) */}
      <Route path="/auth/google/success" element={<GoogleAuthSuccessPage />} />

      {/* Other Roles Placeholders */}
      <Route path="/admin" element={<HomePage />} />
      <Route path="/pos" element={<HomePage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
