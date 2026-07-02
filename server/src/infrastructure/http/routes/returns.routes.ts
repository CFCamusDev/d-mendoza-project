import { Router } from 'express';
import { ReturnRequestController } from '../controllers/ReturnRequestController';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateCreateReturnRequest } from '../middlewares/validators/returnRequestValidator';

import { AdminReturnsController } from '../controllers/AdminReturnsController';
import { GenerateCreditNoteUseCase } from '@application/use-cases/admin/GenerateCreditNoteUseCase';

const router = Router();
const controller = new ReturnRequestController();

const generateCreditNoteUseCase = new GenerateCreditNoteUseCase();
const adminReturnsController = new AdminReturnsController(generateCreditNoteUseCase);

const checkAdmin = (req: any, res: any, next: any) => {
  const roleName = req.auth?.role?.name || req.auth?.role;
  const isAuthorized = roleName === 'ADMIN' || roleName === 'Admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere el rol de Admin',
    });
  }
  next();
};

// Client endpoint
router.post('/returns', requireAuth, validateCreateReturnRequest, controller.create);

// Admin endpoints
router.patch('/admin/returns/:id/approve', requireAuth, checkAdmin, controller.approve);
router.patch('/admin/returns/:id/reject', requireAuth, checkAdmin, controller.reject);
router.post('/admin/returns/:id/credit-note', requireAuth, checkAdmin, adminReturnsController.generateCreditNote);

export default router;
