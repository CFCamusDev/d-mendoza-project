import { Router } from 'express';
import { AuthController } from '@infrastructure/http/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Registration endpoint
router.post('/register', authController.register);

export default router;
