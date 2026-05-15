import { Router } from 'express';
import { BranchController } from '@infrastructure/http/controllers/BranchController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const branchController = new BranchController();

router.get(
  '/branches',
  requirePermission('users:read'),
  branchController.getBranches.bind(branchController)
);

export default router;
