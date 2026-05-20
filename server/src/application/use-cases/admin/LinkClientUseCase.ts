import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IRoleRepository } from '@domain/repositories/IRoleRepository';
import { IEmailService } from '@domain/services/IEmailService';
import { ITransactionManager } from '@domain/repositories/ITransactionManager';
import { Encryption } from '@shared/utils/Encryption';
import crypto from 'crypto';

export class LinkClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly emailService: IEmailService,
    private readonly transactionManager: ITransactionManager
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
      // Si el usuario existe pero no está vinculado al cliente, lo vinculamos en una transacción
      await this.transactionManager.run(async (tx) => {
        await this.clientRepository.linkUser(client.id, existingUser.id, tx);
      });
      return { success: true, message: 'Cliente vinculado a cuenta existente' };
    }

    // Crear cuenta nueva con contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await Encryption.hashPassword(tempPassword);

    await this.transactionManager.run(async (tx) => {
      const newUser = await this.userRepository.create({
        email: client.email,
        name: client.name,
        password: hashedPassword,
        isActive: true, // Activamos la cuenta directamente
        authProvider: 'local'
      }, tx);

      // Asignar rol CLIENT
      const clientRole = await this.roleRepository.findByName('CLIENT');
      if (clientRole) {
        await this.roleRepository.assignRoleToUser(newUser.id, clientRole.id, tx);
      }

      // Vincular cliente con usuario
      await this.clientRepository.linkUser(client.id, newUser.id, tx);
    });

    // Enviar credenciales vía Email (fuera de la transacción de BD).
    // Wrapped in try-catch so a transient email failure does NOT roll back the
    // already-committed DB transaction. The admin will be notified of partial
    // success and can manually trigger a credential re-send if needed.
    try {
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
    } catch (emailError: any) {
      // Log the warning but do NOT rethrow — the account is already linked.
      // The administrator can trigger a credential re-send from a future endpoint.
      console.warn(
        `[LinkClientUseCase] Account linked for client ${client.id} but email delivery failed:`,
        emailError?.message ?? emailError
      );
      return {
        success: true,
        message: 'Cliente vinculado. Advertencia: no se pudo enviar el correo de credenciales.',
      };
    }

    return { success: true, message: 'Cliente vinculado y credenciales enviadas' };
  }
}
