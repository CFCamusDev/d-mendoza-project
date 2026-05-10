import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VerificationCode } from './components/VerificationCode';
import { useVerify } from './hooks/useVerify';

import logoVertical from '@/assets/logo-vertical.png';

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function VerifyPage() {
  useDocumentTitle('Verificar cuenta');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verify, isLoading } = useVerify();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      toast.error('No se detectó un correo electrónico para verificar.');
      navigate('/register');
    }
  }, [email, navigate]);

  const handleComplete = async (code: string) => {
    try {
      await verify(email, code);
      toast.success('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
      
      // Ideally we redirect to login or homepage.
      // Let's navigate to /login as is standard.
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'El código ingresado es inválido o expiró.';
      toast.error(message);
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
          Verifica tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-brand-text">
          Hemos enviado un código de 6 dígitos a:
          <br />
          <span className="font-semibold text-brand-accent">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="mb-6 text-sm text-gray-600">
            Ingresa el código de seguridad para continuar.
          </p>
          
          <VerificationCode onComplete={handleComplete} isLoading={isLoading} />
          
          <div className="mt-6">
            <p className="text-xs text-gray-500">
              ¿No recibiste el código? Revisa tu carpeta de spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
