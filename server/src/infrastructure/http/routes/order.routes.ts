import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { requireAuth, requirePermission } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.get('/orders', requireAuth, orderController.listMyOrders.bind(orderController));
router.get('/orders/:id/receipt/pdf', requireAuth, orderController.downloadReceiptPdf.bind(orderController));
router.patch('/admin/orders/:id/status', requirePermission('roles:manage'), orderController.updateOrderStatus.bind(orderController));

export default router;
