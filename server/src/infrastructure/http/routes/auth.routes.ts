import { Router } from 'express';
import { AuthController } from '@infrastructure/http/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Registration endpoint (HU-002)
router.post('/register', authController.register);

// Account verification endpoint (HU-002 / T-017)
router.post('/verify', authController.verify);

// Login endpoint (HU-094 / T-022)
router.post('/login', authController.login);

export default router;
