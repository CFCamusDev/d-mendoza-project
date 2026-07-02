import { Router } from 'express';
import { InventoryReportController } from '@infrastructure/http/controllers/InventoryReportController';
import { ReportController } from '@infrastructure/http/controllers/ReportController';
import { DispatchReportController } from '@infrastructure/http/controllers/DispatchReportController';
import { GetProfitabilityReportController } from '@infrastructure/http/controllers/GetProfitabilityReportController';
import { GetFinancialDashboardController } from '@infrastructure/http/controllers/GetFinancialDashboardController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new InventoryReportController();
const reportController = new ReportController();
const dispatchReportController = new DispatchReportController();
const profitabilityController = new GetProfitabilityReportController();
const financialDashboardController = new GetFinancialDashboardController();

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

// T-240: Reporte de utilidad bruta y rentabilidad por marca y categoría (HU-069)
router.get(
  '/admin/reports/profitability',
  requirePermission('sales:read'),
  profitabilityController.getReport.bind(profitabilityController)
);

// T-242: Dashboard Financiero Consolidado Multi-canal (HU-070)
router.get(
  '/admin/reports/financial-dashboard',
  requirePermission('sales:read'),
  financialDashboardController.getDashboard.bind(financialDashboardController)
);

// T-249: Reporte de Productos con Baja Rotación (HU-074)
router.get(
  '/admin/reports/low-rotation',
  requirePermission('products:read'), // Assuming 'products:read' or 'sales:read', let's use 'products:read'
  reportController.getLowRotationProducts.bind(reportController)
);

export default router;

