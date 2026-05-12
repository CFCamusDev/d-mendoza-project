import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

/**
 * GoogleAuthSuccessPage — HU-001 / T-036
 *
 * Intermediate page shown after Google OAuth redirect.
 * Displays a loading spinner while useGoogleAuth extracts the session
 * from the httpOnly cookie, hydrates AuthContext, and redirects to Home.
 */
export default function GoogleAuthSuccessPage() {
  useDocumentTitle('Iniciando sesión...');
  const { isLoading, error } = useGoogleAuth();

  return (
    <div
      className="min-h-screen bg-brand-bg flex flex-col items-center justify-center"
      id="google-auth-success-page"
    >
      {isLoading && (
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #4285F4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p className="text-brand-text text-lg font-medium">
            Iniciando sesión con Google...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            ✕
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <p className="text-brand-text text-sm">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      )}
    </div>
  );
}
