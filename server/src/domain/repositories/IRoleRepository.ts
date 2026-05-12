import { Role } from '@domain/entities/Role';

/**
 * Port: Definición del puerto de dominio para la gestión de Roles (RBAC).
 */
export interface IRoleRepository {
  findByName(roleName: string): Promise<Role | null>;
  findById(roleId: number): Promise<Role | null>;
  assignRoleToUser(userId: number, roleId: number): Promise<void>;
  revokeRoleFromUser(userId: number, roleId: number): Promise<void>;
}
