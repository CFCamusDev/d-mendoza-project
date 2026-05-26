import { Router } from 'express';
import { BrandController } from '@infrastructure/http/controllers/BrandController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const brandController = new BrandController();

/**
 * GET /api/v1/config/brand
 * Público: Identidad visual para el frontend e-commerce.
 */
router.get(
  '/config/brand',
  brandController.getBrandConfig.bind(brandController)
);

/**
 * PUT /api/v1/config/brand
 * Protegido: Solo administradores pueden modificar el branding.
 */
router.put(
  '/config/brand',
  requirePermission('roles:manage'), 
  brandController.updateBrandConfig.bind(brandController)
);

export default router;
