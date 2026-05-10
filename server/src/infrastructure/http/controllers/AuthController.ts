import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { RegisterUserDTOSchema } from '@application/dtos/AuthDTO';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';

// Initialize dependencies
const userRepository = new PrismaUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);

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
}
