import { Router } from 'express';
import { AdminAlertsController } from '../controllers/AdminAlertsController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AdminAlertsController();

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

router.get('/admin/alerts/pending-orders', requireAuth, checkSupplyOrAdmin, controller.getPendingOrders);

export default router;
