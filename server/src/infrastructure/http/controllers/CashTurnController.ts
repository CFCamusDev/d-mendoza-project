import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaCashTurnRepository } from '@infrastructure/database/repositories/PrismaCashTurnRepository';
import { OpenCashTurnUseCase } from '@application/use-cases/pos/OpenCashTurnUseCase';

// DI Manual
const cashTurnRepository = new PrismaCashTurnRepository();
const openCashTurnUseCase = new OpenCashTurnUseCase(cashTurnRepository);

// Schemas de Zod
const OpenCashTurnSchema = z.object({
  registerId: z.number().int().positive('El ID de la caja debe ser un entero positivo'),
  openAmount: z.number().nonnegative('El monto inicial no puede ser negativo'),
});

const mapZodErrors = (issues: z.ZodIssue[]) =>
  issues.map((err) => ({ field: err.path.join('.'), message: err.message }));

export class CashTurnController {
  /**
   * POST /api/v1/cash-turns/open
   *
   * Abre un turno de caja para el vendedor autenticado.
   * Solo accesible por Administrador (ADMIN) o Vendedor (SELLER).
   */
  async open(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validar Roles
      const role = req.auth?.role;
      if (role !== 'ADMIN' && role !== 'SELLER') {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado: Solo los roles Administrador o Vendedor están autorizados para abrir caja',
        });
      }

      // 2. Validar Schema
      const validation = OpenCashTurnSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, errors: mapZodErrors(validation.error.issues) });
      }

      // 3. Ejecutar Caso de Uso
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
      }

      const result = await openCashTurnUseCase.execute({
        registerId: validation.data.registerId,
        userId,
        openAmount: validation.data.openAmount,
      });

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message?.includes('no existe')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message?.includes('ya tiene') || error.message?.includes('ya tiene un turno abierto')) {
        return res.status(409).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
