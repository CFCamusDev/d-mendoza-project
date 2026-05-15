import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClientRepository } from '@infrastructure/database/repositories/PrismaClientRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { PrismaRoleRepository } from '@infrastructure/database/repositories/PrismaRoleRepository';
import { ResendEmailService } from '@infrastructure/services/ResendEmailService';
import { LinkClientUseCase } from '@application/use-cases/admin/LinkClientUseCase';
import { BulkLinkClientsUseCase } from '@application/use-cases/admin/BulkLinkClientsUseCase';

const clientRepository = new PrismaClientRepository();
const userRepository = new PrismaUserRepository();
const roleRepository = new PrismaRoleRepository();
const emailService = new ResendEmailService();

const linkClientUseCase = new LinkClientUseCase(
  clientRepository,
  userRepository,
  roleRepository,
  emailService
);
const bulkLinkClientsUseCase = new BulkLinkClientsUseCase(linkClientUseCase);

const BulkLinkSchema = z.object({
  ids: z.array(z.number()),
});

export class ClientController {
  /**
   * GET /api/v1/admin/clients/unlinked
   * List POS clients without an e-commerce account.
   */
  async getUnlinkedClients(req: Request, res: Response) {
    try {
      const clients = await clientRepository.findAllWithoutUser();
      return res.status(200).json({ success: true, data: clients });
    } catch (error: any) {
      console.error('[ClientController.getUnlinkedClients] Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * T-057: POST /api/v1/admin/clients/:id/link
   */
  async linkClient(req: Request, res: Response) {
    try {
      const clientId = parseInt(String(req.params.id), 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
      }

      const result = await linkClientUseCase.execute(clientId);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('[ClientController.linkClient] Error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * T-058: POST /api/v1/admin/clients/bulk-link
   */
  async bulkLink(req: Request, res: Response) {
    try {
      const validation = BulkLinkSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      const report = await bulkLinkClientsUseCase.execute(validation.data.ids);
      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      console.error('[ClientController.bulkLink] Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
