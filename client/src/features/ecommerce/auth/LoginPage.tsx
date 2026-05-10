import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LoginForm } from './components/LoginForm';
import { useLogin } from './hooks/useLogin';
import type { LoginFormData } from './schemas/login.schema';
import logoVertical from '@/assets/logo-vertical.png';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Iniciar sesión');
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
      // T-026: persist JWT in AuthContext and redirect based on role
      // For now, redirect to home after successful login
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch {
      // Generic error toast — intentionally no field detail revealed (security)
      toast.error('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img
          src={logoVertical}
          alt="Logo"
          className="h-32 w-auto object-contain mb-4"
        />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-brand-accent">
          Inicia sesión
        </h2>
        <p className="mt-2 text-center text-sm text-brand-text">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-brand-text hover:text-brand-accent underline transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
