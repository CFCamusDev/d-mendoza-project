import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaBrandConfigRepository } from '@infrastructure/database/repositories/PrismaBrandConfigRepository';
import { PrismaAuditLogRepository } from '@infrastructure/database/repositories/PrismaAuditLogRepository';
import { GetBrandConfigUseCase } from '@application/use-cases/brand/GetBrandConfigUseCase';
import { UpdateBrandConfigUseCase } from '@application/use-cases/brand/UpdateBrandConfigUseCase';

const BrandConfigSchema = z.object({
  brandName: z.string(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string(),
  socialLinksJson: z.any().optional().nullable(),
});

const brandConfigRepository = new PrismaBrandConfigRepository();
const auditLogRepository = new PrismaAuditLogRepository();
const getBrandConfigUseCase = new GetBrandConfigUseCase(brandConfigRepository);
const updateBrandConfigUseCase = new UpdateBrandConfigUseCase(brandConfigRepository, auditLogRepository);

export class BrandController {
  /**
   * GET /api/v1/config/brand
   * Público: Obtiene la configuración de identidad visual.
   */
  async getBrandConfig(_req: Request, res: Response) {
    try {
      const config = await getBrandConfigUseCase.execute();
      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      console.error('[BrandController.getBrandConfig] Error:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  /**
   * PUT /api/v1/config/brand
   * Privado: Solo Administrador. Actualiza la configuración de identidad visual.
   */
  async updateBrandConfig(req: Request, res: Response) {
    try {
      const validation = BrandConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      // Solución C-04 / C-02: Leer desde req.auth en lugar de req.user para la auditoría
      const adminUserId = req.auth?.userId ?? null;

      const config = await updateBrandConfigUseCase.execute(validation.data, adminUserId);

      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      console.error('[BrandController.updateBrandConfig] Error:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

