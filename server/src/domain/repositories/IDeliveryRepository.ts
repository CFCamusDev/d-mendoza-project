import { Delivery } from '@domain/entities/Delivery';

export interface IDeliveryRepository {
  findById(id: number): Promise<Delivery | null>;
  createDeliveryWithItems(
    orderId: number,
    items: Array<{ variantId: number; qty: number }>
  ): Promise<Delivery>;
  assignDeliveryMan(id: number, deliveryManId: number): Promise<Delivery>;
  findPaidOrdersWithoutDelivery(): Promise<any[]>;
  findDeliveriesByStatus(status: string): Promise<Delivery[]>;
}
