import { Router } from 'express';
import { InventoryReportController } from '@infrastructure/http/controllers/InventoryReportController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new InventoryReportController();

router.get('/reports/inventory-rotation', requirePermission('products:read'), ctrl.inventoryRotation.bind(ctrl));

export default router;
