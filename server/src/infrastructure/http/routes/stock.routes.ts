import { Router } from 'express';
import { StockAdjustmentController } from '@infrastructure/http/controllers/StockAdjustmentController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new StockAdjustmentController();

router.post('/stock/adjustments', requirePermission('products:write'), ctrl.create.bind(ctrl));

export default router;
