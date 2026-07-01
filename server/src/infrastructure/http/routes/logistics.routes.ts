import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new LogisticsController();

const checkSupplyOrAdmin = (req: any, res: any, next: any) => {
  const roleName = req.auth?.role?.name || req.auth?.role;
  const isAuthorized =
    roleName === 'ADMIN' ||
    roleName === 'Admin' ||
    roleName === 'SUPPLY' ||
    roleName === 'Abastecimiento' ||
    roleName === 'Abastecedor';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere el rol de Admin o Abastecimiento',
    });
  }
  next();
};

router.get('/logistics/orders/pending', requireAuth, checkSupplyOrAdmin, controller.getPendingOrders);
router.post('/logistics/picking', requireAuth, checkSupplyOrAdmin, controller.picking);
router.post('/logistics/deliveries/:id/assign', requireAuth, checkSupplyOrAdmin, controller.assign);
router.get('/logistics/deliveries/:id/label', requireAuth, checkSupplyOrAdmin, controller.getLabel);

export default router;
