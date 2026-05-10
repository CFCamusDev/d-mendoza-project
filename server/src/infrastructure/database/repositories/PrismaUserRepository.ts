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

  async create(data: CreateUserDTO): Promise<User> {
    const record = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? null,
        password: data.password,
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
   * Mapea el registro de Prisma a la entidad del dominio,
   * desacoplando los tipos de Prisma del dominio.
   */
  private toDomain(record: {
    id: number;
    email: string;
    name: string | null;
    password: string;
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
      lastLogin: record.lastLogin,
      isActive: record.isActive,
      verificationPin: record.verificationPin,
      pinExpiresAt: record.pinExpiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
