import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new LogisticsController();

const checkLogisticsOrAdmin = (req: any, res: any, next: any) => {
  const roleName = req.auth?.role?.name || req.auth?.role;
  const isAuthorized =
    roleName === 'ADMIN' ||
    roleName === 'Admin' ||
    roleName === 'LOGISTICS' ||
    roleName === 'Logística' ||
    roleName === 'Logistica';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere el rol de Admin o Personal de Logística',
    });
  }
  next();
};

router.post('/logistics/picking', requireAuth, checkLogisticsOrAdmin, controller.picking);
router.post('/logistics/deliveries/:id/assign', requireAuth, checkLogisticsOrAdmin, controller.assign);
router.get('/logistics/deliveries/:id/label', requireAuth, checkLogisticsOrAdmin, controller.getLabel);

export default router;
