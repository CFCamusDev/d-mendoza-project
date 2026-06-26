import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { requireAuth, requirePermission } from '../middlewares/auth.middleware';

import { AdminOrderController } from '../controllers/AdminOrderController';

const router = Router();
const orderController = new OrderController();
const adminOrderController = new AdminOrderController();

router.get('/orders', requireAuth, orderController.listMyOrders.bind(orderController));
router.get('/orders/:id/receipt/pdf', requireAuth, orderController.downloadReceiptPdf.bind(orderController));
router.get('/admin/orders', requirePermission('roles:manage'), adminOrderController.listOrders.bind(adminOrderController));
router.patch('/admin/orders/:id/status', requirePermission('roles:manage'), orderController.updateOrderStatus.bind(orderController));

export default router;
