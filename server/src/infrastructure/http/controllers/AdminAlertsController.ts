import { Request, Response, NextFunction } from 'express';
import { GetPendingOrderAlertsUseCase } from '@application/use-cases/admin/GetPendingOrderAlertsUseCase';

export class AdminAlertsController {
  private getPendingOrderAlertsUseCase: GetPendingOrderAlertsUseCase;

  constructor() {
    this.getPendingOrderAlertsUseCase = new GetPendingOrderAlertsUseCase();
  }

  getPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getPendingOrderAlertsUseCase.execute();
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
