import { Router } from 'express';
import { DiscountController } from '@infrastructure/http/controllers/pos/DiscountController';
import { SaleController } from '@infrastructure/http/controllers/pos/SaleController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

/**
 * HU-034 / T-125: Rutas del módulo POS (Punto de Venta).
 * Todas las rutas están protegidas por RBAC mediante `requirePermission`.
 *
 * Prefijo montado en app.ts: /api/v1/pos
 */

const router = Router();
const discountController = new DiscountController();
const saleController = new SaleController();

/**
 * POST /api/v1/pos/discounts/validate
 *
 * Verifica el permiso del rol actual y calcula el descuento (porcentaje o monto fijo)
 * sobre el carrito de compra enviado. Devuelve el desglose financiero completo.
 *
 * @permission pos:discounts — Solo roles con este permiso (ej. ADMIN, CAJERO_SENIOR)
 *             pueden aplicar descuentos desde el POS.
 */
router.post(
  '/discounts/validate',
  requirePermission('pos:discounts'),
  discountController.validate.bind(discountController)
);

/**
 * POST /api/v1/pos/sales
 *
 * Registra una venta en el POS, procesando múltiples métodos de pago,
 * creando el registro de la orden, los pagos y descontando el stock.
 *
 * @permission pos:sales — Solo roles con este permiso pueden procesar ventas.
 */
router.post(
  '/sales',
  requirePermission('pos:sales'),
  saleController.processSale.bind(saleController)
);

export default router;
