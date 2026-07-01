import { Request, Response, NextFunction } from 'express';
import { PrismaDeliveryRepository } from '@infrastructure/database/repositories/PrismaDeliveryRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { PrismaOrderRepository } from '@infrastructure/database/repositories/PrismaOrderRepository';
import { PdfKitShippingLabelService } from '@infrastructure/services/PdfKitShippingLabelService';
import { GeneratePickingListUseCase } from '@application/use-cases/logistics/GeneratePickingListUseCase';
import { AssignDeliveryManUseCase } from '@application/use-cases/logistics/AssignDeliveryManUseCase';
import { GenerateShippingLabelUseCase } from '@application/use-cases/logistics/GenerateShippingLabelUseCase';
import { GetPendingOrdersUseCase } from '@application/use-cases/logistics/GetPendingOrdersUseCase';
import { GetDeliveriesUseCase } from '@application/use-cases/logistics/GetDeliveriesUseCase';
import { GetDeliveryMenUseCase } from '@application/use-cases/logistics/GetDeliveryMenUseCase';

export class LogisticsController {
  private generatePickingListUseCase: GeneratePickingListUseCase;
  private assignDeliveryManUseCase: AssignDeliveryManUseCase;
  private generateShippingLabelUseCase: GenerateShippingLabelUseCase;
  private getPendingOrdersUseCase: GetPendingOrdersUseCase;
  private getDeliveriesUseCase: GetDeliveriesUseCase;
  private getDeliveryMenUseCase: GetDeliveryMenUseCase;

  constructor() {
    const deliveryRepo = new PrismaDeliveryRepository();
    const userRepo = new PrismaUserRepository();
    const orderRepo = new PrismaOrderRepository();
    const shippingLabelService = new PdfKitShippingLabelService();

    this.generatePickingListUseCase = new GeneratePickingListUseCase(deliveryRepo);
    this.assignDeliveryManUseCase = new AssignDeliveryManUseCase(deliveryRepo, userRepo);
    this.generateShippingLabelUseCase = new GenerateShippingLabelUseCase(
      deliveryRepo,
      orderRepo,
      shippingLabelService
    );
    this.getPendingOrdersUseCase = new GetPendingOrdersUseCase(deliveryRepo);
    this.getDeliveriesUseCase = new GetDeliveriesUseCase(deliveryRepo);
    this.getDeliveryMenUseCase = new GetDeliveryMenUseCase(userRepo);
  }

  picking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderIds } = req.body || {};
      const deliveries = await this.generatePickingListUseCase.execute(
        orderIds ? orderIds.map(Number) : undefined
      );
      res.status(201).json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error) {
      next(error);
    }
  };

  getPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.getPendingOrdersUseCase.execute();
      res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  };

  getDeliveries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query;
      const deliveries = await this.getDeliveriesUseCase.execute(status as string | undefined);
      res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error) {
      next(error);
    }
  };

  getDeliveryMen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deliveryMen = await this.getDeliveryMenUseCase.execute();
      res.status(200).json({ success: true, count: deliveryMen.length, data: deliveryMen });
    } catch (error) {
      next(error);
    }
  };

  assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deliveryId = Number(req.params.id);
      const { deliveryManId } = req.body;

      if (isNaN(deliveryId) || !deliveryManId || isNaN(Number(deliveryManId))) {
        res.status(400).json({ success: false, error: 'Invalid delivery ID or deliveryManId' });
        return;
      }

      const delivery = await this.assignDeliveryManUseCase.execute(deliveryId, Number(deliveryManId));
      res.status(200).json({ success: true, data: delivery });
    } catch (error: any) {
      if (error.message?.includes('not found') || error.message?.includes('no encontrado')) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: error.message });
    }
  };

  getLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deliveryId = Number(req.params.id);

      if (isNaN(deliveryId)) {
        res.status(400).json({ success: false, error: 'Invalid delivery ID' });
        return;
      }

      const stream = await this.generateShippingLabelUseCase.execute(deliveryId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="shipping-label-${deliveryId}.pdf"`);

      stream.pipe(res);
    } catch (error: any) {
      if (error.message?.includes('not found') || error.message?.includes('no encontrado')) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };
}
