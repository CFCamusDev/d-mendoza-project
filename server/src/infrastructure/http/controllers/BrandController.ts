import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaBrandConfigRepository } from '@infrastructure/database/repositories/PrismaBrandConfigRepository';
import { PrismaAuditLogRepository } from '@infrastructure/database/repositories/PrismaAuditLogRepository';
import { GetBrandConfigUseCase } from '@application/use-cases/brand/GetBrandConfigUseCase';
import { UpdateBrandConfigUseCase } from '@application/use-cases/brand/UpdateBrandConfigUseCase';
import { CloudinaryStorageService } from '@infrastructure/services/CloudinaryStorageService';

const BrandConfigSchema = z.object({
  brandName: z.string(),
  faviconUrl: z.string().optional().nullable(),
  logoHorizontalUrl: z.string().optional().nullable(),
  logoVerticalUrl: z.string().optional().nullable(),
  colorBrandBg: z.string(),
  colorBrandPrimary: z.string(),
  colorBrandText: z.string(),
  colorBrandAccent: z.string(),
  socialLinksJson: z.any().optional().nullable(),
});

const brandConfigRepository = new PrismaBrandConfigRepository();
const auditLogRepository = new PrismaAuditLogRepository();
const getBrandConfigUseCase = new GetBrandConfigUseCase(brandConfigRepository);
const updateBrandConfigUseCase = new UpdateBrandConfigUseCase(brandConfigRepository, auditLogRepository);
const storageService = new CloudinaryStorageService();

export class BrandController {
  async getBrandConfig(_req: Request, res: Response) {
    try {
      const config = await getBrandConfigUseCase.execute();
      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateBrandConfig(req: Request, res: Response) {
    try {
      const validation = BrandConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }
      const adminUserId = req.auth?.userId ?? null;
      const config = await updateBrandConfigUseCase.execute(validation.data, adminUserId);
      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'La imagen del logo es requerida' });
      }

      // Subir imagen a Cloudinary usando el storage configurado
      const imageUrl = await storageService.uploadImage(req.file.buffer, req.file.originalname);
      return res.status(201).json({ success: true, data: { url: imageUrl } });
    } catch (error: any) {
      console.error('Error en uploadLogo:', error);
      return res.status(500).json({ success: false, error: 'Error al subir el logo a Cloudinary' });
    }
  }
}
