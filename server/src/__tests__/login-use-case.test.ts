import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LoginUseCase, LoginDTO } from '@application/use-cases/LoginUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IAuditService, AuditAction, AuditModule } from '@domain/services/AuditService';
import { User } from '@domain/entities/User';
import bcrypt from 'bcrypt';

// ---- Mocks ----

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn<IUserRepository['findById']>(),
  findByEmail: jest.fn<IUserRepository['findByEmail']>(),
  create: jest.fn<IUserRepository['create']>(),
  updateLastLogin: jest.fn<IUserRepository['updateLastLogin']>(),
  updateVerificationPin: jest.fn<IUserRepository['updateVerificationPin']>(),
  deleteById: jest.fn<IUserRepository['deleteById']>(),
};

const mockAuditService: jest.Mocked<IAuditService> = {
  record: jest.fn<IAuditService['record']>(),
  getAll: jest.fn<IAuditService['getAll']>(),
  getById: jest.fn<IAuditService['getById']>(),
};

// ---- Test Suite ----

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  const hashedPassword = bcrypt.hashSync('Password123!', 10);

  const fakeUser: User = {
    id: 1,
    email: 'test@dmendoza.com',
    name: 'Test User',
    password: hashedPassword,
    lastLogin: null,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    loginUseCase = new LoginUseCase(mockUserRepository, mockAuditService);
  });

  it('debería autenticar al usuario con credenciales válidas', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
    mockUserRepository.updateLastLogin.mockResolvedValue();
    mockAuditService.record.mockResolvedValue();

    const dto: LoginDTO = { email: 'test@dmendoza.com', password: 'Password123!' };
    const result = await loginUseCase.execute(dto);

    expect(result.user.id).toBe(1);
    expect(result.user.email).toBe('test@dmendoza.com');
    expect(result.user.name).toBe('Test User');
    // RF-17: lastLogin debe estar actualizado
    expect(result.user.lastLogin).toBeInstanceOf(Date);
    // No debe contener password en la respuesta
    expect((result.user as any).password).toBeUndefined();
  });

  it('RF-17: debería actualizar lastLogin en cada login exitoso', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
    mockUserRepository.updateLastLogin.mockResolvedValue();
    mockAuditService.record.mockResolvedValue();

    const dto: LoginDTO = { email: 'test@dmendoza.com', password: 'Password123!' };
    await loginUseCase.execute(dto);

    expect(mockUserRepository.updateLastLogin).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(
      fakeUser.id,
      expect.any(Date),
    );
  });

  it('RF-84: debería registrar un log de auditoría en cada login exitoso', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
    mockUserRepository.updateLastLogin.mockResolvedValue();
    mockAuditService.record.mockResolvedValue();

    const dto: LoginDTO = { email: 'test@dmendoza.com', password: 'Password123!' };
    await loginUseCase.execute(dto);

    expect(mockAuditService.record).toHaveBeenCalledTimes(1);
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: fakeUser.id,
        action: AuditAction.LOGIN,
        module: AuditModule.AUTH,
        details: expect.objectContaining({ email: fakeUser.email }),
      }),
    );
  });

  it('debería lanzar error con email inexistente', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const dto: LoginDTO = { email: 'noexiste@dmendoza.com', password: 'Password123!' };

    await expect(loginUseCase.execute(dto)).rejects.toThrow('Credenciales inválidas');
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockAuditService.record).not.toHaveBeenCalled();
  });

  it('debería lanzar error con contraseña incorrecta', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(fakeUser);

    const dto: LoginDTO = { email: 'test@dmendoza.com', password: 'WrongPassword!' };

    await expect(loginUseCase.execute(dto)).rejects.toThrow('Credenciales inválidas');
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockAuditService.record).not.toHaveBeenCalled();
  });

  it('no debería registrar auditoría ni actualizar lastLogin si el login falla', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const dto: LoginDTO = { email: 'noexiste@dmendoza.com', password: 'x' };

    await expect(loginUseCase.execute(dto)).rejects.toThrow();

    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockAuditService.record).not.toHaveBeenCalled();
  });
});
