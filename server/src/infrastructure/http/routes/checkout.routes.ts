import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const checkoutController = new CheckoutController();

router.post('/calculate', requireAuth, checkoutController.calculate.bind(checkoutController));

export default router;
