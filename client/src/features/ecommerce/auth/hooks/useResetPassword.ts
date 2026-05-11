import { useState } from 'react';
import { getApiUrl } from '@/shared/config/env';
import type { ResetPasswordFormData } from '../schemas/resetPassword.schema';

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (token: string, data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract explicit string error returned by backend tests
        throw new Error(typeof result.error === 'string' ? result.error : 'Error al restablecer contraseña');
      }

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading };
};
