import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../features/ecommerce/auth/RegisterPage';
import VerifyPage from '../features/ecommerce/auth/VerifyPage';

import logoVertical from '@/assets/logo-vertical.png';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Redirect index to register for now since it is our current task focus */}
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      {/* Placeholder for login page for routing support */}
      <Route 
        path="/login" 
        element={
          <div className="flex flex-col items-center justify-center h-screen bg-brand-bg text-brand-accent gap-4">
            <img src={logoVertical} alt="Logo" className="h-40" />
            <h1 className="text-2xl font-bold">Login Screen Placeholder</h1>
            <p className="text-brand-text">¡Tu cuenta ha sido verificada exitosamente!</p>
          </div>
        } 
      />
    </Routes>
  );
};
