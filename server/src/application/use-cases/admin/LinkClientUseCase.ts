import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IRoleRepository } from '@domain/repositories/IRoleRepository';
import { IEmailService } from '@domain/services/IEmailService';
import { Encryption } from '@shared/utils/Encryption';
import crypto from 'crypto';

export class LinkClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(clientId: number): Promise<{ success: boolean; message: string }> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    if (client.userId) {
      throw new Error('El cliente ya tiene una cuenta vinculada');
    }

    // Verificar si el email ya existe en User (por si acaso no está vinculado pero existe)
    const existingUser = await this.userRepository.findByEmail(client.email);
    if (existingUser) {
      // Si el usuario existe pero no está vinculado al cliente, lo vinculamos
      await this.clientRepository.linkUser(client.id, existingUser.id);
      return { success: true, message: 'Cliente vinculado a cuenta existente' };
    }

    // Crear cuenta nueva con contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await Encryption.hashPassword(tempPassword);

    const newUser = await this.userRepository.create({
      email: client.email,
      name: client.name,
      password: hashedPassword,
      isActive: true, // Activamos la cuenta directamente
      authProvider: 'local'
    });

    // Asignar rol CLIENT
    const clientRole = await this.roleRepository.findByName('CLIENT');
    if (clientRole) {
      await this.roleRepository.assignRoleToUser(newUser.id, clientRole.id);
    }

    // Vincular cliente con usuario
    await this.clientRepository.linkUser(client.id, newUser.id);

    // Enviar credenciales vía Email
    await this.emailService.sendEmail(
      client.email,
      'Bienvenido a D\'Mendoza - Tus credenciales de acceso',
      `
      <h1>Hola ${client.name}</h1>
      <p>Se ha creado tu cuenta en nuestro portal E-commerce.</p>
      <p>Tus credenciales de acceso son:</p>
      <ul>
        <li><strong>Email:</strong> ${client.email}</li>
        <li><strong>Contraseña temporal:</strong> ${tempPassword}</li>
      </ul>
      <p>Te recomendamos cambiar tu contraseña al iniciar sesión.</p>
      `
    );

    return { success: true, message: 'Cliente vinculado y credenciales enviadas' };
  }
}
