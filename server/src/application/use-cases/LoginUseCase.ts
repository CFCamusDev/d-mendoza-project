import bcrypt from 'bcrypt';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IAuditService, AuditModule, AuditAction } from '@domain/services/AuditService';
import { LoginDTO, LoginResultDTO } from '@application/dtos/auth.dto';

// Re-export para que los consumidores existentes no necesiten cambiar su fuente de importación.
export type { LoginDTO, LoginResultDTO } from '@application/dtos/auth.dto';

/**
 * Caso de uso: Login de usuario.
 * RF-17: Actualiza lastLogin en cada login exitoso.
 * RF-84: Registra evento de auditoría para login.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: IAuditService,
  ) { }

  async execute(dto: LoginDTO): Promise<LoginResultDTO> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // 3. RF-17: Actualizar lastLogin
    const now = new Date();
    await this.userRepository.updateLastLogin(user.id, now);

    // 4. RF-84: Registrar auditoría de login
    await this.auditService.record({
      userId: user.id,
      action: AuditAction.LOGIN,
      module: AuditModule.AUTH,
      details: { email: user.email, loginAt: now.toISOString() },
    });

    // 5. Retornar DTO sin password
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastLogin: now,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
