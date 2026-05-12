import prisma from '@infrastructure/database/prisma';
import { IRoleRepository } from '@domain/repositories/IRoleRepository';
import { Role } from '@domain/entities/Role';

/**
 * Infrastructure Adapter: Concrete repository implementing persistent Role handling via Prisma client.
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
   * Leverages native Prisma 'connect' atomic operation managing granular many-to-many relational bridges
   * without overwriting or clobbering pre-existing active user role affiliations.
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
