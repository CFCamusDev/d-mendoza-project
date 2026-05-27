import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import logoHorizontal from '@/assets/logo-horizontal.png';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  Image as ImageIcon, 
  Palette, 
  Users, 
  Home,

} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Enlaces de navegación exclusiva para administradores
  const adminNavLinks = [
    { label: 'Banners', path: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Identidad Visual', path: '/admin/branding', icon: <Palette className="w-4 h-4" /> },
    { label: 'Empleados', path: '/admin/employees', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* HEADER PRINCIPAL RESPONSIVO */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-primary/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoHorizontal} alt="D'Mendoza Logo" className="h-9 md:h-11 object-contain transition-transform hover:scale-[1.02]" />
          </Link>

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

            {/* Enlaces Administrativos si es ADMIN */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <div className="flex items-center gap-3 border-l border-brand-primary/60 pl-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-accent/50 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </span>
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all px-2.5 py-1.5 rounded-lg ${
                      isActiveRoute(link.path)
                        ? 'text-white bg-brand-accent'
                        : 'text-brand-text hover:text-brand-accent hover:bg-brand-primary/20'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Área del Usuario (Login/Logout/Perfil) - Desktop */}
          <div className="hidden md:flex items-center gap-4">
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

              {/* Enlaces de Administración */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <div className="space-y-2 pt-4 border-t border-brand-primary/60">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-accent/50 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Panel Administrativo
                  </p>
                  {adminNavLinks.map((link) => (
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
              <img src={logoHorizontal} alt="D'Mendoza" className="h-10 brightness-[10] object-contain" />
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Plataforma e-commerce premium D'Mendoza. Redefiniendo la elegancia y experiencia de compra digital con diseño de vanguardia.
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
                {/* Iconos Redes Sociales genéricos con SVG */}
                <a href="https://facebook.com" className="text-slate-300 hover:text-brand-primary transition-colors" target="_blank" rel="noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://instagram.com" className="text-slate-300 hover:text-brand-primary transition-colors" target="_blank" rel="noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divisor & Copyright */}
          <div className="border-t border-brand-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} D'Mendoza E-Commerce. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#terminos" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#privacidad" className="hover:text-white transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
