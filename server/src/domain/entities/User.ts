/**
 * Domain Entity: User
 * Representa al usuario del sistema sin dependencias de infraestructura.
 * RF-17: Incluye lastLogin para rastrear último inicio de sesión.
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  password: string;
  lastLogin: Date | null;
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
}

/**
 * DTO para la respuesta de usuario (sin password).
 */
export interface UserResponseDTO {
  id: number;
  email: string;
  name: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
