/**
 * Domain Entity: User
 * Representa al usuario del sistema sin dependencias de infraestructura.
 * RF-17: Incluye lastLogin para rastrear último inicio de sesión.
 * HU-001: Incluye googleId, avatarUrl y authProvider para OAuth.
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  password: string;
  googleId?: string | null;
  avatarUrl?: string | null;
  authProvider: string; // "local" | "google"
  lastLogin?: Date | null;
  isActive: boolean;
  verificationPin?: string | null;
  pinExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear un nuevo usuario (sin campos autogenerados).
 */
export interface CreateUserDTO {
  email: string;
  name?: string;
  password: string;
  googleId?: string;
  avatarUrl?: string;
  authProvider?: string;
  isActive?: boolean;
}

