import { Request, Response, NextFunction } from 'express';
import { CreateBatchCouponsUseCase } from '@application/use-cases/admin/CreateBatchCouponsUseCase';
import { GetAdminCouponsUseCase } from '@application/use-cases/admin/GetAdminCouponsUseCase';

export class AdminCouponController {
  constructor(
    private createBatchCouponsUseCase: CreateBatchCouponsUseCase,
    private getAdminCouponsUseCase: GetAdminCouponsUseCase
  ) {}

  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        prefix,
        quantity,
        type,
        value,
        minPurchaseAmount,
        specificProductId,
        specificCategoryId,
        expiresAt,
        maxUses,
      } = req.body;

      const result = await this.createBatchCouponsUseCase.execute({
        prefix: prefix || 'COUPON',
        quantity: quantity ? parseInt(quantity, 10) : 1,
        type,
        value: parseFloat(value),
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : undefined,
        specificProductId: specificProductId ? parseInt(specificProductId, 10) : undefined,
        specificCategoryId: specificCategoryId ? parseInt(specificCategoryId, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      let isActive: boolean | undefined;
      if (req.query.isActive !== undefined) {
        isActive = req.query.isActive === 'true';
      }

      const result = await this.getAdminCouponsUseCase.execute({
        page,
        limit,
        isActive,
      });

      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      next(error);
    }
  }
}
