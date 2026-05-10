import { IUserRepository } from '@domain/repositories/IUserRepository';
import { RegisterUserDTO } from '@application/dtos/AuthDTO';
import { Encryption } from '@shared/utils/Encryption';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) { }

  async execute(dto: RegisterUserDTO) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Correo electrónico ya registrado');
    }

    const hashedPassword = await Encryption.hashPassword(dto.password);

    const newUser = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      isActive: newUser.isActive,
      message: "El usuario se ha creado correctamente. A la espera de verificación.",
    };
  }
}
