import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@infrastructure/database/prisma';

const QuerySchema = z.object({
  variantId: z.string().regex(/^\d+$/).transform(Number),
  branchId: z.string().regex(/^\d+$/).transform(Number),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export class KardexController {
  /**
   * T-102: GET /api/v1/kardex?variantId=&branchId=&from=&to=
   * Returns all KardexEntry rows with accumulated balance and historical unit cost.
   */
  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = QuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues });
      }

      const { variantId, branchId, from, to } = parsed.data;

      const entries = await prisma.kardexEntry.findMany({
        where: {
          variantId,
          branchId,
          ...(from || to ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          } : {}),
        },
        orderBy: { createdAt: 'asc' },
        include: { variant: { select: { sku: true } }, branch: { select: { name: true } } },
      });

      return res.status(200).json({
        success: true,
        data: entries.map(e => ({
          id: e.id,
          type: e.type,
          quantity: e.quantity,
          unitCost: e.unitCost,
          balanceQty: e.balanceQty,
          balanceCost: e.balanceCost,
          sku: e.variant.sku,
          branch: e.branch.name,
          createdAt: e.createdAt,
        })),
      });
    } catch (e) { next(e); }
  }
}
