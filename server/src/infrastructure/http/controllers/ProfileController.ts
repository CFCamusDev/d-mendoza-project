import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { CloudinaryStorageService } from '@infrastructure/services/CloudinaryStorageService';
import { UpdateProfileUseCase } from '@application/use-cases/profile/UpdateProfileUseCase';

const userRepository = new PrismaUserRepository();
const storageService = new CloudinaryStorageService();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository, storageService);

// Validation Schema with strict E.164 phone format validation (HU-005)
const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres' })
    .optional(),
  lastName: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(50, { message: 'El apellido no puede exceder 50 caracteres' })
    .optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: 'El número de teléfono debe estar en formato internacional E.164 (ej: +51999888777)',
    })
    .optional(),
});

export class ProfileController {
  /**
   * HU-005: PATCH /api/v1/profile
   * Updates client profile data (name, lastName, phone, and optional avatar image).
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Acceso no autorizado: Contexto de seguridad faltante',
        });
      }

      // 1. Zod Fields Validation
      const validation = UpdateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          errors: validation.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const { name, lastName, phone } = validation.data;

      // 2. Extract Avatar File from Multer
      let avatarFile = undefined;
      if (req.file) {
        avatarFile = {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
        };
      }

      // 3. Execute Use Case
      const updatedProfile = await updateProfileUseCase.execute(userId, {
        name,
        lastName,
        phone,
        avatarFile,
      });

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updatedProfile,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
