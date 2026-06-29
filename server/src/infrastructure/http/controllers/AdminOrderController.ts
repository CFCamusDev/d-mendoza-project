import { Request, Response, NextFunction } from 'express';
import { PrismaOrderRepository } from '@infrastructure/database/repositories/PrismaOrderRepository';
import { ListAdminOrdersUseCase } from '@application/use-cases/admin/ListAdminOrdersUseCase';

export class AdminOrderController {
  private listAdminOrdersUseCase: ListAdminOrdersUseCase;

  constructor() {
    const orderRepo = new PrismaOrderRepository();
    this.listAdminOrdersUseCase = new ListAdminOrdersUseCase(orderRepo);
  }

  listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, from, to, cursor, limit, userId } = req.query;
      
      const result = await this.listAdminOrdersUseCase.execute({
        status: status as string,
        from: from as string,
        to: to as string,
        cursor: cursor ? Number(cursor) : undefined,
        limit: limit ? Number(limit) : 20,
        userId: userId ? Number(userId) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
