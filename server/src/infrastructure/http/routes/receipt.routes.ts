import { Router } from 'express';
import { ReceiptController } from '@infrastructure/http/controllers/ReceiptController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const controller = new ReceiptController();

// GET /api/v1/receipts - Listar comprobantes electrónicos (HU-055 T-152)
router.get(
  '/receipts',
  requirePermission('sales:read'),
  controller.getReceipts.bind(controller)
);

export default router;
