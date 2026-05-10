import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { VerifyUserUseCase } from '@application/use-cases/auth/VerifyUserUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RegisterUserDTOSchema, VerifyUserDTOSchema, LoginDTOSchema } from '@application/dtos/AuthDTO';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { ResendEmailService } from '@infrastructure/services/ResendEmailService';
import { JwtService } from '@infrastructure/services/JwtService';

// Initialize dependencies
const userRepository = new PrismaUserRepository();
const emailService = new ResendEmailService();
const jwtService = new JwtService();
const registerUserUseCase = new RegisterUserUseCase(userRepository, emailService);
const verifyUserUseCase = new VerifyUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, jwtService);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate input
      const validationResult = RegisterUserDTOSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error.issues,
        });
      }

      // Execute Use Case
      const result = await registerUserUseCase.execute(validationResult.data);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Correo electrónico ya registrado') {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      console.error('[AuthController.register] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      // Validate input
      const validationResult = VerifyUserDTOSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error.issues,
        });
      }

      // Execute Use Case
      await verifyUserUseCase.execute(validationResult.data);

      return res.status(200).json({
        success: true,
        message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
      });
    } catch (error: any) {
      if (error.message === 'La cuenta ya se encuentra verificada') {
        return res.status(409).json({ success: false, error: error.message });
      }

      if (
        error.message === 'El código de verificación ha expirado. Por favor, regístrese nuevamente.' ||
        error.message === 'No existe un código de verificación activo para esta cuenta'
      ) {
        return res.status(410).json({ success: false, error: error.message });
      }

      if (error.message === 'PIN inválido o expirado') {
        return res.status(400).json({ success: false, error: error.message });
      }

      console.error('[AuthController.verify] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Validate input
      const validationResult = LoginDTOSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error.issues,
        });
      }

      // Execute Use Case
      const tokens = await loginUseCase.execute(validationResult.data);

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      // Generic credential error → 401 (prevents email enumeration)
      if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({ success: false, error: error.message });
      }

      // Inactive/unverified account → 403
      if (error.message === 'Cuenta inactiva o no verificada') {
        return res.status(403).json({ success: false, error: error.message });
      }

      console.error('[AuthController.login] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
