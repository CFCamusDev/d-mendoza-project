import { Router } from 'express';
import { AuthController } from '@infrastructure/http/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Registration endpoint
router.post('/register', authController.register);

// Account verification endpoint (T-017)
router.post('/verify', authController.verify);

export default router;
