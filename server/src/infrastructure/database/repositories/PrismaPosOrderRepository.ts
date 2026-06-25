import prisma from '@infrastructure/database/prisma';
import { IPosOrderRepository } from '@domain/repositories/IPosOrderRepository';

export class PrismaPosOrderRepository implements IPosOrderRepository {
  async getSalesTotalInRange(start: Date, end: Date): Promise<number> {
    const result = await prisma.posOrder.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        total: true,
      },
    });
    return result._sum.total ? Number(result._sum.total) : 0;
  }

  async getSalesByBranchInRange(start: Date, end: Date): Promise<Array<{ branchId: number; totalSales: number }>> {
    const groups = await prisma.posOrder.groupBy({
      by: ['branchId'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        total: true,
      },
    });

    return groups.map((g) => ({
      branchId: g.branchId,
      totalSales: g._sum.total ? Number(g._sum.total) : 0,
    }));
  }
}
