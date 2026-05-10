import bcrypt from 'bcrypt';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { LoginDTO } from '@application/dtos/AuthDTO';
import { JwtService, AuthTokens } from '@infrastructure/services/JwtService';

/**
 * Application Use Case: Login with email and password (HU-094).
 *
 * Business rules enforced:
 * 1. User must exist in the system.
 * 2. Password must match the stored bcrypt hash.
 * 3. User account must be active (isActive === true).
 * 4. On any credential failure, throws a generic error to prevent
 *    email enumeration attacks (HTTP 401 at controller level).
 * 5. On inactive account, throws a distinct error (HTTP 403 at controller level).
 * 6. On success, updates lastLogin and returns JWT access + refresh tokens.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthTokens> {
    // Step 1: Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    // Step 2: Validate existence and password — generic error to avoid enumeration
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Step 3: Verify account is active and verified
    if (!user.isActive) {
      throw new Error('Cuenta inactiva o no verificada');
    }

    // Step 4: Update last login timestamp
    await this.userRepository.updateLastLogin(user.id, new Date());

    // Step 5: Generate and return JWT tokens (role hardcoded as 'customer' until
    // RBAC module is implemented in HU-004)
    const tokens = this.jwtService.generateTokens({
      userId: user.id,
      email: user.email,
      role: 'customer',
    });

    return tokens;
  }
}
