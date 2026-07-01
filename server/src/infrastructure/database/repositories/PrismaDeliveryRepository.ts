import prisma from '@infrastructure/database/prisma';
import { IDeliveryRepository } from '@domain/repositories/IDeliveryRepository';
import { Delivery, PickingItem } from '@domain/entities/Delivery';

export class PrismaDeliveryRepository implements IDeliveryRepository {
  private toDomain(record: any): Delivery {
    return {
      id: record.id,
      orderId: record.orderId,
      deliveryManId: record.deliveryManId,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      pickingItems: record.pickingItems?.map((item: any) => this.toPickingItemDomain(item)),
    };
  }

  private toPickingItemDomain(item: any): PickingItem {
    return {
      id: item.id,
      deliveryId: item.deliveryId,
      variantId: item.variantId,
      qty: item.qty,
      pickedAt: item.pickedAt,
      variantSku: item.variant?.sku,
      productName: item.variant?.product?.name,
    };
  }

  async findById(id: number): Promise<Delivery | null> {
    const record = await prisma.delivery.findUnique({
      where: { id },
      include: {
        pickingItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async createDeliveryWithItems(
    orderId: number,
    items: Array<{ variantId: number; qty: number }>
  ): Promise<Delivery> {
    const record = await prisma.delivery.create({
      data: {
        orderId,
        status: 'PENDING',
        pickingItems: {
          create: items.map((item) => ({
            variantId: item.variantId,
            qty: item.qty,
          })),
        },
      },
      include: {
        pickingItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return this.toDomain(record);
  }

  async assignDeliveryMan(id: number, deliveryManId: number): Promise<Delivery> {
    const record = await prisma.delivery.update({
      where: { id },
      data: {
        deliveryManId,
        status: 'ASSIGNED',
      },
      include: {
        pickingItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return this.toDomain(record);
  }

  async findPaidOrdersWithoutDelivery(): Promise<any[]> {
    // Orders with status 'PAID' that do NOT have a Delivery record
    return await prisma.order.findMany({
      where: {
        status: 'PAID',
        delivery: {
          is: null,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findDeliveriesByStatus(status: string): Promise<Delivery[]> {
    const records = await prisma.delivery.findMany({
      where: {
        status: status as any,
      },
      include: {
        pickingItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return records.map((record) => this.toDomain(record));
  }
}
