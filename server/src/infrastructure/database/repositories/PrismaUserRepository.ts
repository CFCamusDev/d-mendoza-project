import prisma from '@infrastructure/database/prisma';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User, CreateUserDTO } from '@domain/entities/User';

/**
 * Adaptador de infraestructura: Implementación del repositorio de usuarios con Prisma.
 * Mapea entre el modelo de Prisma y la entidad del dominio.
 */
export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  /**
   * HU-001: Busca un usuario por su Google ID (OAuth).
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { googleId } });
    return record ? this.toDomain(record) : null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const record = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? null,
        password: data.password,
        googleId: data.googleId ?? null,
        avatarUrl: data.avatarUrl ?? null,
        authProvider: data.authProvider ?? 'local',
      },
    });
    return this.toDomain(record);
  }

  /**
   * RF-17: Actualiza el campo lastLogin del usuario.
   */
  async updateLastLogin(userId: number, date: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: date },
    });
  }

  async updateVerificationPin(userId: number, pin: string, expiresAt: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationPin: pin,
        pinExpiresAt: expiresAt,
      },
    });
  }

  async deleteById(userId: number): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * RF-03: Activa el usuario y limpia los campos del PIN por seguridad.
   */
  async activateUser(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        verificationPin: null,
        pinExpiresAt: null,
      },
    });
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }

  /**
   * HU-009 / T-049: Toggles the isActive flag for admin-driven status management.
   * The isActive field (Boolean, default false) was introduced in migration
   * 20260510093523_add_user_is_active. This method exposes it as a writable
   * operation for the admin status endpoint (T-050).
   */
  async updateStatus(userId: number, isActive: boolean): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  /**
   * HU-001: Vincula un Google ID a un usuario existente (email match).
   */
  async updateGoogleId(userId: number, googleId: string, avatarUrl?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        avatarUrl: avatarUrl ?? undefined,
        authProvider: 'google',
      },
    });
  }

  /**
   * Mapea el registro de Prisma a la entidad del dominio,
   * desacoplando los tipos de Prisma del dominio.
   */
  private toDomain(record: {
    id: number;
    email: string;
    name: string | null;
    password: string;
    googleId: string | null;
    avatarUrl: string | null;
    authProvider: string;
    lastLogin: Date | null;
    isActive: boolean;
    verificationPin: string | null;
    pinExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      password: record.password,
      googleId: record.googleId,
      avatarUrl: record.avatarUrl,
      authProvider: record.authProvider,
      lastLogin: record.lastLogin,
      isActive: record.isActive,
      verificationPin: record.verificationPin,
      pinExpiresAt: record.pinExpiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
