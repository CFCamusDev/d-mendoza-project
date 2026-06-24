import { Request, Response, NextFunction } from 'express';
import prisma from '@infrastructure/database/prisma';

export class ProductOnSaleController {
  async getOnSale(req: Request, res: Response, next: NextFunction) {
    try {
      const variantsData = await prisma.productVariant.findMany({
        where: {
          discountPercent: { gt: 0 },
          isActive: true,
          product: { isActive: true },
        },
        include: {
          product: {
            include: {
              images: true,
              category: true,
              brand: true,
            },
          },
          branchStock: true,
        },
        orderBy: { discountPercent: 'desc' },
      });

      const resultData = variantsData.map((variant) => {
        const stockQuantity = variant.branchStock.reduce((sum, bs) => sum + bs.quantity, 0);

        return {
          id: variant.id,
          productId: variant.productId,
          sku: variant.sku,
          price: Number(variant.price),
          discountPercent: variant.discountPercent,
          attributesJson: variant.attributesJson,
          isActive: variant.isActive,
          minStock: variant.minStock,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
          stock: stockQuantity,
          outOfStock: stockQuantity <= 0,
          product: variant.product,
        };
      });

      return res.status(200).json({
        success: true,
        data: resultData,
      });
    } catch (error) {
      next(error);
    }
  }
}
