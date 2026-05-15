import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '@infrastructure/database/prisma';
import { DEFAULT_BRAND_CONFIG } from '@domain/entities/BrandConfig';

const BrandConfigSchema = z.object({
  brandName: z.string(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string(),
  socialLinksJson: z.any().optional().nullable(),
});

export class BrandController {
  /**
   * GET /api/v1/config/brand
   * Público: Obtiene la configuración de identidad visual.
   */
  async getBrandConfig(_req: Request, res: Response) {
    try {
      let config = await prisma.brandConfig.findUnique({
        where: { id: 1 },
      });

      // Si no existe, devolvemos los valores por defecto desde el dominio
      if (!config) {
        config = DEFAULT_BRAND_CONFIG;
      }

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

      const { brandName, logoUrl, primaryColor, socialLinksJson } = validation.data;

      const config = await prisma.brandConfig.upsert({
        where: { id: 1 },
        update: {
          brandName,
          logoUrl,
          primaryColor,
          socialLinksJson: socialLinksJson || {},
        },
        create: {
          id: 1,
          brandName,
          logoUrl,
          primaryColor,
          socialLinksJson: socialLinksJson || {},
        },
      });

      // Audit log
      const adminUser = req.user as { id: number; email: string; role: string } | undefined;
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_BRAND_CONFIG',
          module: 'SYSTEM_CONFIG',
          details: { config },
          userId: adminUser?.id ?? null,
        },
      });

      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      console.error('[BrandController.updateBrandConfig] Error:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
