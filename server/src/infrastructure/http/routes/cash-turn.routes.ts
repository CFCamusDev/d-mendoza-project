import { Router } from 'express';
import { CashTurnController } from '@infrastructure/http/controllers/CashTurnController';
import { requireAuth } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const controller = new CashTurnController();

// POST /api/v1/cash-turns/open — Abrir turno de caja (HU-032)
router.post(
  '/cash-turns/open',
  requireAuth,
  controller.open.bind(controller)
);

export default router;
