import { Router } from 'express';
import { ClientController } from '@infrastructure/http/controllers/ClientController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const clientController = new ClientController();

/**
 * T-205: List unified clients base
 */
router.get(
  '/admin/clients',
  requirePermission('users:read'),
  clientController.getUnifiedClients.bind(clientController)
);

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

/**
 * T-206: Update client details
 */
router.put(
  '/admin/clients/:id',
  requirePermission('users:write'),
  clientController.updateClient.bind(clientController)
);

export default router;
