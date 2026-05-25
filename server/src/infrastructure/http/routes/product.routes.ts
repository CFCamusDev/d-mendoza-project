import { Router } from 'express';
import { ProductVariantController } from '@infrastructure/http/controllers/ProductVariantController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const productVariantController = new ProductVariantController();

// ─────────────────────────────────────────────────────────────────────────────
// Rutas de Productos y Variantes — HU-014
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/products/:id/variants — Listar variantes de un producto
router.get(
  '/products/:id/variants',
  requirePermission('products:read'),
  productVariantController.getVariantsByProduct.bind(productVariantController)
);

// POST /api/v1/products/:id/variants — Generar variantes con SKU auto-generado
router.post(
  '/products/:id/variants',
  requirePermission('products:write'),
  productVariantController.createVariants.bind(productVariantController)
);

// PUT /api/v1/variants/:id — Editar precio y/o SKU de una variante individual
router.put(
  '/variants/:id',
  requirePermission('products:write'),
  productVariantController.updateVariant.bind(productVariantController)
);

export default router;
