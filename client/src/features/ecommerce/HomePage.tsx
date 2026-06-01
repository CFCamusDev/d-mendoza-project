import { useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoHorizontal from '@/assets/logo-horizontal.png';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER')) {
      navigate('/admin/inventory/stock', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 text-center">
      <img src={logoHorizontal} alt="Logo" className="h-16 mb-8" />
      
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full border border-brand-primary">
        <h1 className="text-2xl font-bold text-brand-accent mb-4">
          🎉 ¡Autenticación Exitosa!
        </h1>
        
        <p className="text-brand-text mb-6">
          Has ingresado correctamente al sistema. Este es un placeholder del E-Commerce Home.
        </p>

        {isAuthenticated && user ? (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6 text-left text-sm space-y-2">
            <p><strong>ID:</strong> <span className="font-mono text-xs">{user.id}</span></p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p>
              <strong>Rol Asignado:</strong> 
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role}
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6 text-red-700">
            No hay sesión activa detectada.
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-text hover:bg-brand-accent transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
