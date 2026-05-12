import { IRoleRepository } from '@domain/repositories/IRoleRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

/**
 * Application Service: Gestiona la lógica de negocio del control de acceso (HU-004).
 * Coordina los repositorios de usuarios y roles para aplicar la asignación segura.
 */
export class RoleService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Asigna un rol a un usuario validando existencias previas.
   */
  async assignRole(userId: number, roleName: string): Promise<void> {
    // 1. Validar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Validar que el rol especificado existe en la base de datos
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new Error(`El rol '${roleName}' no está definido en el sistema`);
    }

    // 3. Proceder con la vinculación segura
    await this.roleRepository.assignRoleToUser(user.id, role.id);
  }

  /**
   * Remueve un rol específico de un usuario sin afectar el resto de sus permisos.
   */
  async revokeRole(userId: number, roleName: string): Promise<void> {
    // 1. Validar existencia del usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Validar existencia del rol
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new Error(`El rol '${roleName}' no existe`);
    }

    // 3. Desvincular
    await this.roleRepository.revokeRoleFromUser(user.id, role.id);
  }
}
