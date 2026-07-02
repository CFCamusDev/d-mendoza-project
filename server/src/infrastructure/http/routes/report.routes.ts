import { Router } from 'express';
import { InventoryReportController } from '@infrastructure/http/controllers/InventoryReportController';
import { ReportController } from '@infrastructure/http/controllers/ReportController';
import { DispatchReportController } from '@infrastructure/http/controllers/DispatchReportController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new InventoryReportController();
const reportController = new ReportController();
const dispatchReportController = new DispatchReportController();

router.get('/reports/inventory-rotation', requirePermission('products:read'), ctrl.inventoryRotation.bind(ctrl));

/**
 * T-207: Export reports in standard formats (PDF, Excel, CSV)
 */
router.get(
  '/reports/export',
  requirePermission('sales:read'),
  reportController.exportReport.bind(reportController)
);

// T-232: Reporte de eficiencia del proceso de despacho (HU-067)
router.get(
  '/reports/dispatch-efficiency',
  requirePermission('sales:read'),
  dispatchReportController.getEfficiency,
);

export default router;
