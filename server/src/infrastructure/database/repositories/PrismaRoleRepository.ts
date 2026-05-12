import prisma from '@infrastructure/database/prisma';
import { IRoleRepository } from '@domain/repositories/IRoleRepository';
import { Role } from '@domain/entities/Role';

/**
 * Adapter de Infraestructura: Repositorio concreto para manejo de Roles usando Prisma.
 */
export class PrismaRoleRepository implements IRoleRepository {
  async findByName(name: string): Promise<Role | null> {
    const record = await prisma.role.findUnique({
      where: { name },
      include: { permissions: true },
    });
    return record as Role | null; // Directly compliant struct
  }

  async findById(id: number): Promise<Role | null> {
    const record = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    return record as Role | null;
  }

  async create(data: { name: string; description?: string | null }): Promise<Role> {
    const record = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
    return record as Role;
  }

  /**
   * Utiliza la operación 'connect' de Prisma para gestionar relaciones many-to-many
   * sin sobreescribir o resetear otros roles que ya posea el usuario.
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });
  }

  async revokeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
    });
  }
}
