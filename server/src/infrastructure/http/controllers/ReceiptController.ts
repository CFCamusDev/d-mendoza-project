import { Request, Response, NextFunction } from 'express';
import { GetReceiptsUseCase } from '@application/use-cases/admin/GetReceiptsUseCase';

const getReceiptsUseCase = new GetReceiptsUseCase();

export class ReceiptController {
  /**
   * GET /api/v1/receipts
   * Listar de manera paginada y filtrada las ventas/comprobantes del sistema POS.
   */
  async getReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId ? parseInt(String(req.query.branchId), 10) : undefined;
      const type = req.query.type === 'cross-branch' || req.query.type === 'normal' ? req.query.type : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      let from: Date | undefined = undefined;
      if (req.query.from) {
        from = new Date(String(req.query.from));
      }

      let to: Date | undefined = undefined;
      if (req.query.to) {
        to = new Date(String(req.query.to));
        // Ajustamos la fecha de fin al final del día si solo viene formato YYYY-MM-DD
        if (!String(req.query.to).includes('T')) {
          to.setHours(23, 59, 59, 999);
        }
      }

      const result = await getReceiptsUseCase.execute({
        branchId,
        from,
        to,
        type,
        page,
        limit,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }
}
