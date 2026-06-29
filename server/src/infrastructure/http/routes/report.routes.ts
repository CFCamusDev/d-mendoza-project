import { Router } from 'express';
import { InventoryReportController } from '@infrastructure/http/controllers/InventoryReportController';
import { ReportController } from '@infrastructure/http/controllers/ReportController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new InventoryReportController();
const reportController = new ReportController();

router.get('/reports/inventory-rotation', requirePermission('products:read'), ctrl.inventoryRotation.bind(ctrl));

/**
 * T-207: Export reports in standard formats (PDF, Excel, CSV)
 */
router.get(
  '/reports/export',
  requirePermission('sales:read'),
  reportController.exportReport.bind(reportController)
);

export default router;
