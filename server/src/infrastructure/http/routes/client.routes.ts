import { Router } from 'express';
import { ClientController } from '@infrastructure/http/controllers/ClientController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const clientController = new ClientController();

/**
 * T-059 helper: List clients without account
 */
router.get(
  '/admin/clients/unlinked',
  requirePermission('users:read'),
  clientController.getUnlinkedClients.bind(clientController)
);

/**
 * T-057: Link single client
 */
router.post(
  '/admin/clients/:id/link',
  requirePermission('users:write'),
  clientController.linkClient.bind(clientController)
);

/**
 * T-058: Bulk link clients
 */
router.post(
  '/admin/clients/bulk-link',
  requirePermission('users:write'),
  clientController.bulkLink.bind(clientController)
);

export default router;
