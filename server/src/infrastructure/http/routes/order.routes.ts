import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.get('/orders', requireAuth, orderController.listMyOrders.bind(orderController));
router.get('/orders/:id/receipt/pdf', requireAuth, orderController.downloadReceiptPdf.bind(orderController));

export default router;
