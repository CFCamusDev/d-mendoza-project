import { User, CreateUserDTO } from '@domain/entities/User';

/**
 * Port: Repositorio de usuarios (puerto del dominio).
 * Define las operaciones permitidas sin acoplarse a la infraestructura.
 */
export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  updateLastLogin(userId: number, date: Date): Promise<void>;
  updateVerificationPin(userId: number, pin: string, expiresAt: Date): Promise<void>;
  deleteById(userId: number): Promise<void>;
  activateUser(userId: number): Promise<void>;
  updatePassword(userId: number, passwordHash: string): Promise<void>;
}
