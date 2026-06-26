import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClientRepository } from '@infrastructure/database/repositories/PrismaClientRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { PrismaRoleRepository } from '@infrastructure/database/repositories/PrismaRoleRepository';
import { ResendEmailService } from '@infrastructure/services/ResendEmailService';
import { PrismaTransactionManager } from '@infrastructure/database/PrismaTransactionManager';
import { LinkClientUseCase } from '@application/use-cases/admin/LinkClientUseCase';
import { BulkLinkClientsUseCase } from '@application/use-cases/admin/BulkLinkClientsUseCase';
import { JwtService } from '@infrastructure/services/JwtService';
import { GetUnifiedClientsUseCase } from '@application/use-cases/admin/GetUnifiedClientsUseCase';

const clientRepository = new PrismaClientRepository();
const userRepository = new PrismaUserRepository();
const roleRepository = new PrismaRoleRepository();
const emailService = new ResendEmailService();
const transactionManager = new PrismaTransactionManager();
const jwtService = new JwtService();

const linkClientUseCase = new LinkClientUseCase(
  clientRepository,
  userRepository,
  roleRepository,
  emailService,
  transactionManager,
  jwtService
);
const bulkLinkClientsUseCase = new BulkLinkClientsUseCase(linkClientUseCase);
const getUnifiedClientsUseCase = new GetUnifiedClientsUseCase(clientRepository);

const BulkLinkSchema = z.object({
  ids: z.array(z.number()),
});

const GetUnifiedClientsQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().positive().default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().positive().default(10)),
  type: z.enum(['POS', 'ECOMMERCE', 'ALL']).default('ALL'),
  search: z.string().optional(),
});


export class ClientController {
  /**
   * GET /api/v1/admin/clients/unlinked
   * List POS clients without an e-commerce account.
   */
  async getUnlinkedClients(_req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientRepository.findAllWithoutUser();
      return res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  }

  /**
   * T-057: POST /api/v1/admin/clients/:id/link
   */
  async linkClient(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(String(req.params.id), 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
      }

      const result = await linkClientUseCase.execute(clientId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * T-058: POST /api/v1/admin/clients/bulk-link
   */
  async bulkLink(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = BulkLinkSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      const report = await bulkLinkClientsUseCase.execute(validation.data.ids);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/clients
   * List unified base clients with filters and pagination.
   */
  async getUnifiedClients(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = GetUnifiedClientsQuerySchema.safeParse(req.query);
      if (!validation.success) {
        const mappedErrors = validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ success: false, error: mappedErrors });
      }

      const { page, limit, type, search } = validation.data;
      const result = await getUnifiedClientsUseCase.execute({
        page,
        limit,
        type,
        search,
      });

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

