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

  async findPaidOrdersWithoutDelivery(orderIds?: number[]): Promise<any[]> {
    const whereClause: any = {
      status: 'PAID',
      delivery: {
        is: null,
      },
    };

    if (orderIds && orderIds.length > 0) {
      whereClause.id = {
        in: orderIds,
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        user: true,
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      customerName: [order.user?.name, order.user?.lastName].filter(Boolean).join(' ') || 'Cliente',
      itemsCount: order.items.reduce((acc: number, item: any) => acc + item.qty, 0),
      totalAmount: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));
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
