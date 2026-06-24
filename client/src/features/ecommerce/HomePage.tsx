import { useAuth } from '@/shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoHorizontal from '@/assets/logo-horizontal.png';
import BestSellersSection from './components/BestSellersSection';
import OnSaleSection from './components/OnSaleSection';
import { SearchBar } from './components/SearchBar';

import { useCart } from './hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { cart, openCart } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header temporal */}
      <header className="bg-brand-bg border-b border-brand-primary p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <img src={logoHorizontal} alt="Logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
          
          <div className="flex-grow max-w-xl mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={openCart}
              className="relative p-2 text-brand-accent hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="font-medium text-brand-accent hidden sm:inline">Hola, {user?.name || user?.email?.split('@')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-brand-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pb-16">
        {/* Banner Placeholder */}
        <section className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center relative overflow-hidden">
           <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
           <div className="relative z-10 text-center px-4">
             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-white/80 p-4 rounded-lg inline-block">Colección 2026</h1>
             <p className="text-xl text-gray-800 bg-white/80 px-4 py-2 rounded-lg font-medium shadow-sm">Encuentra tu estilo perfecto</p>
           </div>
        </section>

        {/* Nuevas Secciones Automáticas */}
        <BestSellersSection />
        <OnSaleSection />
        
      </main>

      <CartDrawer />
    </div>
  );
}
