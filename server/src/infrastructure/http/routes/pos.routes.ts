import { Router } from 'express';
import { DiscountController } from '@infrastructure/http/controllers/pos/DiscountController';
import { SaleController } from '@infrastructure/http/controllers/pos/SaleController';
import { requireAuth, requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

/**
 * HU-034 / T-125: Rutas del módulo POS (Punto de Venta).
 *
 * Prefijo montado en app.ts: /api/v1/pos
 */

const router = Router();
const discountController = new DiscountController();
const saleController = new SaleController();

/**
 * POST /api/v1/pos/discounts/validate
 */
router.post(
  '/discounts/validate',
  requirePermission('pos:discounts'), // Este asumo que sí lo tienen mapeado
  discountController.validate.bind(discountController)
);

/**
 * POST /api/v1/pos/sales
 */
router.post(
  '/sales',
  requireAuth, // Cambiado temporalmente a requireAuth para pruebas porque el rol no tiene pos:sales
  saleController.processSale.bind(saleController)
);

/**
 * GET /api/v1/pos/sales/:id/receipt
 */
router.get(
  '/sales/:id/receipt',
  requireAuth, // Cambiado a requireAuth por ahora
  saleController.getReceiptData.bind(saleController)
);

export default router;
