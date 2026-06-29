import prisma from '@infrastructure/database/prisma';
import { IStockAlertRepository } from '@domain/repositories/IStockAlertRepository';

export class PrismaStockAlertRepository implements IStockAlertRepository {
  async getActiveAlertsWithQuantity(): Promise<Array<{
    sku: string;
    productName: string;
    branchName: string;
    currentStock: number;
    minStock: number;
  }>> {
    const alerts = await prisma.stockAlert.findMany({
      where: {
        isActive: true,
        variant: {
          isActive: true,
        },
      },
      include: {
        variant: {
          select: {
            sku: true,
            minStock: true,
            product: {
              select: {
                name: true,
              },
            },
            branchStock: {
              select: {
                branchId: true,
                quantity: true,
                status: true,
              },
            },
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    return alerts.map((a) => {
      const stock = a.variant.branchStock.find(
        (s) => s.branchId === a.branchId && s.status === 'AVAILABLE'
      );
      return {
        sku: a.variant.sku,
        productName: a.variant.product.name,
        branchName: a.branch.name,
        currentStock: stock ? stock.quantity : 0,
        minStock: a.variant.minStock,
      };
    });
  }
}
