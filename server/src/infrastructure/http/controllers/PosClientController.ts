import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuickRegisterClientUseCase } from '@application/use-cases/pos/QuickRegisterClientUseCase';
import { FactilizaService } from '@infrastructure/services/FactilizaService';
import { PrismaClientRepository } from '@infrastructure/database/repositories/PrismaClientRepository';
import { SearchPosClientsUseCase } from '@application/use-cases/pos/SearchPosClientsUseCase';

const quickRegisterUseCase = new QuickRegisterClientUseCase();
const factilizaService = new FactilizaService();
const clientRepository = new PrismaClientRepository();
const searchUseCase = new SearchPosClientsUseCase(clientRepository);

const QuickRegisterSchema = z.object({
  documentType: z.enum(['DNI', 'RUC']),
  documentId: z.string().min(8, 'El número de documento debe tener al menos 8 caracteres').max(11, 'El número de documento debe tener un máximo de 11 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('El formato del correo electrónico es inválido').optional().or(z.literal('')),
});

const mapZodErrors = (issues: z.ZodIssue[]) =>
  issues.map((err) => ({ field: err.path.join('.'), message: err.message }));

export class PosClientController {
  /**
   * POST /api/v1/pos/clients/quick-register
   * Realiza el registro rápido de un cliente desde el POS usando la API de Factiliza.
   */
  async quickRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = QuickRegisterSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, errors: mapZodErrors(validation.error.issues) });
      }

      // Convert DNI (8) / RUC (11) validation
      const { documentType, documentId, phone, email } = validation.data;
      if (documentType === 'DNI' && documentId.length !== 8) {
        return res.status(400).json({ success: false, error: 'El DNI debe tener exactamente 8 dígitos' });
      }
      if (documentType === 'RUC' && documentId.length !== 11) {
        return res.status(400).json({ success: false, error: 'El RUC debe tener exactamente 11 dígitos' });
      }

      const client = await quickRegisterUseCase.execute({
        documentType,
        documentId,
        phone,
        email: email || undefined,
      });

      return res.status(201).json({ success: true, data: client });
    } catch (error: any) {
      if (error.statusCode === 409) {
        return res.status(409).json({ success: false, error: error.message });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/clients/lookup?type=...&number=...
   * Consulta los datos de un cliente predictivo por DNI o RUC en la API de Factiliza.
   */
  async lookup(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '').toUpperCase();
      const number = String(req.query.number || '').trim();

      if (type !== 'DNI' && type !== 'RUC') {
        return res.status(400).json({ success: false, error: 'El parámetro type debe ser DNI o RUC' });
      }

      if (type === 'DNI' && number.length !== 8) {
        return res.status(400).json({ success: false, error: 'El número de DNI debe tener exactamente 8 dígitos' });
      }

      if (type === 'RUC' && number.length !== 11) {
        return res.status(400).json({ success: false, error: 'El número de RUC debe tener exactamente 11 dígitos' });
      }

      const result = await factilizaService.lookupDocument(type as 'DNI' | 'RUC', number);
      if (!result.success) {
        return res.status(404).json({ success: false, error: 'Documento no encontrado en el padrón o inválido' });
      }

      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/clients/search?q=...
   * Busca clientes locales por DNI, RUC o Nombre/Apellido con paginación máxima de 10 registros.
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q || '').trim();
      if (!q) {
        return res.status(400).json({ success: false, error: 'El parámetro de búsqueda q es obligatorio' });
      }

      const page = parseInt(String(req.query.page || '1'), 10);
      const parsedPage = isNaN(page) || page < 1 ? 1 : page;

      const result = await searchUseCase.execute(q, parsedPage);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      next(error);
    }
  }

  async getLoyaltyBalance(req: Request, res: Response) {
    try {
      const clientId = parseInt(String(req.params.id), 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ success: false, error: 'ID inválido' });
      }

      // Check if client has user account attached
      const client = await (new PrismaClientRepository()).findById(clientId);
      if (!client || !client.userId) {
        return res.status(200).json({ success: true, data: { balance: 0 } });
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const account = await prisma.loyaltyAccount.findUnique({
        where: { userId: client.userId }
      });

      return res.status(200).json({ success: true, data: { balance: account?.balance || 0 } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
