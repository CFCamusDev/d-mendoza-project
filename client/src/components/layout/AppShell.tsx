import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { SearchBar } from '@/features/ecommerce/components/SearchBar';

import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  Home,
  Link as LinkIcon,
  ShoppingCart
} from 'lucide-react';
import { useBrand } from '@/shared/context/BrandContext';
import { useCart } from '@/features/ecommerce/hooks/useCart';
import { CartDrawer } from '@/features/ecommerce/components/CartDrawer';

export const AppShell: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { brandConfig } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, openCart } = useCart();

  const cartItemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Helper for dynamic social icons using inline SVGs
  const getSocialIcon = (key: string) => {
    const className = "w-5 h-5";
    switch (key.toLowerCase()) {
      case 'facebook': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
      case 'instagram': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
      case 'twitter':
      case 'x': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
      case 'tiktok': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
      case 'youtube': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>;
      case 'linkedin': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
      default: return <LinkIcon className={className} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Enlaces de navegación pública / e-commerce
  const publicNavLinks = [
    { label: 'Inicio', path: '/', icon: <Home className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* HEADER PRINCIPAL RESPONSIVO */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-primary/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {brandConfig?.logoHorizontalUrl ? (
              <img src={brandConfig.logoHorizontalUrl} alt={brandConfig?.brandName || "D'Mendoza Logo"} className="h-9 md:h-11 object-contain transition-transform hover:scale-[1.02]" />
            ) : (
              <span className="text-xl font-bold tracking-tight text-brand-accent">{brandConfig?.brandName || "D'Mendoza"}</span>
            )}
          </Link>
          
          {/* Barra de Búsqueda Predictiva (Desktop) */}
          <div className="hidden md:block flex-grow max-w-xs lg:max-w-md mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Menú de Navegación - Pantallas Medianas (Tablet) y Grandes (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-all px-3 py-1.5 rounded-lg ${
                  isActiveRoute(link.path)
                    ? 'text-white bg-brand-accent'
                    : 'text-brand-text hover:text-brand-accent hover:bg-brand-primary/20'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Enlace al Panel de Control si es ADMIN o SELLER */}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <div className="flex items-center gap-3 border-l border-brand-primary/60 pl-6">
                <Link
                  to="/admin/inventory/stock"
                  className="flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Panel de Control
                </Link>
              </div>
            )}
          </nav>

          {/* Área del Usuario (Login/Logout/Perfil) - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Botón del Carrito */}
            <button
              onClick={openCart}
              className="relative p-2 text-brand-text hover:text-brand-accent hover:bg-brand-primary/20 rounded-full transition-colors mr-2"
              title="Ver Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand-accent border border-white rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center border border-brand-accent/20">
                    <User className="w-4 h-4 text-brand-accent" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all border border-red-200/50"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-brand-text hover:text-brand-accent px-3 py-1.5 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-accent text-white hover:bg-brand-accent/90 px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all scale-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón de Menú Móvil - Pantallas Pequeñas */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-accent hover:bg-brand-primary/20 rounded-lg transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE (RESPONSIVO MOBILE/TABLET) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          <nav 
            className="absolute top-16 right-0 w-72 bg-[#F7F7F5] border-l border-brand-primary shadow-2xl h-[calc(100vh-4rem)] p-6 flex flex-col justify-between animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Barra de Búsqueda (Móvil) */}
              <div className="pb-4 border-b border-brand-primary/60">
                <SearchBar />
              </div>

              {/* Enlaces Públicos */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Navegación</p>
                {publicNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 text-sm font-semibold p-2.5 rounded-xl transition-all ${
                      isActiveRoute(link.path)
                        ? 'text-white bg-brand-accent shadow'
                        : 'text-brand-text hover:text-brand-accent hover:bg-brand-primary/30'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Enlace del Panel de Control en Móvil */}
              {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER') && (
                <div className="space-y-2 pt-4 border-t border-brand-primary/60">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-accent/50 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Panel Administrativo
                  </p>
                  <Link
                    to="/admin/inventory/stock"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold p-2.5 rounded-xl transition-all text-white bg-brand-accent shadow"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    Panel de Control
                  </Link>
                </div>
              )}
            </div>

            {/* Sesión de Usuario - Móvil */}
            <div className="pt-6 border-t border-brand-primary/60 space-y-4">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-brand-accent hover:bg-brand-primary/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center border border-brand-accent/20">
                      <User className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Sesión activa</p>
                      <p className="text-sm font-bold truncate max-w-[160px]">{user.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100/80 p-3 rounded-xl transition-colors border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center text-sm font-semibold text-brand-text hover:text-brand-accent p-2.5 border border-brand-primary rounded-xl transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center text-sm font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 p-2.5 rounded-xl shadow transition-colors"
                  >
                    Registro
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* ÁREA DE CONTENIDO CENTRAL - CONTENEDOR RESPONSIVO */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* FOOTER RESPONSIVO */}
      <footer className="bg-brand-accent text-[#F7F7F5] border-t border-brand-primary/30 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Columna 1: Branding y Descripción */}
            <div className="space-y-4">
              {brandConfig?.logoHorizontalUrl ? (
                <img src={brandConfig.logoHorizontalUrl} alt={brandConfig?.brandName || "D'Mendoza"} className="h-10 brightness-[10] object-contain" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-white">{brandConfig?.brandName || "D'Mendoza"}</span>
              )}
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Plataforma e-commerce premium {brandConfig?.brandName || "D'Mendoza"}. Redefiniendo la elegancia y experiencia de compra digital con diseño de vanguardia.
              </p>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-primary">Enlaces del E-Commerce</h4>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li><Link to="/" className="hover:text-brand-primary transition-colors">Catálogo General</Link></li>
                <li><Link to="/profile" className="hover:text-brand-primary transition-colors">Mi Cuenta de Usuario</Link></li>
                <li><Link to="/unauthorized" className="hover:text-brand-primary transition-colors">Seguridad de Accesos</Link></li>
              </ul>
            </div>

            {/* Columna 3: Información y Soporte */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-primary">Soporte Comercial</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ¿Tienes consultas o problemas con tu pedido?<br />
                Escríbenos a: <span className="text-brand-primary font-semibold">soporte@dmendoza.com</span>
              </p>
              <div className="flex gap-4 pt-2">
                {brandConfig?.socialLinksJson && Object.entries(brandConfig.socialLinksJson).map(([platform, url]) => (
                  <a key={platform} href={url as string} className="text-slate-300 hover:text-brand-primary transition-colors" target="_blank" rel="noreferrer" title={platform}>
                    {getSocialIcon(platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divisor & Copyright */}
          <div className="border-t border-brand-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} {brandConfig?.brandName || "D'Mendoza"} E-Commerce. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#terminos" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#privacidad" className="hover:text-white transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Drawer del Carrito */}
      <CartDrawer />
    </div>
  );
};
