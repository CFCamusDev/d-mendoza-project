import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateStockTransferUseCase } from '@application/use-cases/inventory/CreateStockTransferUseCase';

const CreateTransferSchema = z.object({
  fromBranchId: z.number().int().positive('La sucursal de origen debe ser un ID válido'),
  toBranchId: z.number().int().positive('La sucursal de destino debe ser un ID válido'),
  variantId: z.number().int().positive('La variante del producto debe ser un ID válido'),
  quantity: z.number().positive('La cantidad debe ser mayor a cero'),
});

const createStockTransferUseCase = new CreateStockTransferUseCase();

export class StockTransferController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateTransferSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: parsed.error.issues,
        });
      }

      const result = await createStockTransferUseCase.execute(parsed.data);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.statusCode === 400) {
        return res.status(400).json({ success: false, error: error.message });
      }
      if (error.statusCode === 404) {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
