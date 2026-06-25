import { Order } from '@domain/entities/Order';

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<Order | null>;
  createOrderWithTransaction(
    orderData: {
      userId: number;
      status: string;
      total: number;
      shippingCost: number;
      addressSnapshot: any;
      paymentIntentId: string;
    },
    items: Array<{
      variantId: number;
      qty: number;
      unitPrice: number;
    }>
  ): Promise<Order>;
  findByUserId(
    userId: number,
    params: {
      status?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ orders: Order[]; totalCount: number }>;
}
