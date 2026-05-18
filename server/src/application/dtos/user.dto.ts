/**
 * DTO de respuesta de usuario (sin password).
 * RF-17: Incluye lastLogin para mostrar el último inicio de sesión.
 * Pertenece a la capa de aplicación: define la forma de los datos
 * que se exponen hacia afuera, sin exponer campos internos del dominio.
 */
export interface UserResponseDTO {
  id: number;
  email: string;
  name: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
