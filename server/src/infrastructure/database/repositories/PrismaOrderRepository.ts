import prisma from '@infrastructure/database/prisma';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order, OrderItem } from '@domain/entities/Order';

export class PrismaOrderRepository implements IOrderRepository {
  private toDomain(record: any): Order {
    return {
      id: record.id,
      userId: record.userId,
      status: record.status,
      total: Number(record.total),
      shippingCost: Number(record.shippingCost),
      addressSnapshot: record.addressSnapshot,
      paymentIntentId: record.paymentIntentId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      items: record.items?.map((item: any) => this.toItemDomain(item)),
    };
  }

  private toItemDomain(item: any): OrderItem {
    return {
      id: item.id,
      orderId: item.orderId,
      variantId: item.variantId,
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      variantSku: item.variant?.sku,
      productName: item.variant?.product?.name,
    };
  }

  async findById(id: number): Promise<Order | null> {
    const record = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
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

  async findByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
    const record = await prisma.order.findUnique({
      where: { paymentIntentId },
      include: {
        items: {
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

  async createOrderWithTransaction(
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
  ): Promise<Order> {
    const record = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: orderData.userId,
          status: orderData.status as any,
          total: orderData.total,
          shippingCost: orderData.shippingCost,
          addressSnapshot: orderData.addressSnapshot,
          paymentIntentId: orderData.paymentIntentId,
        },
      });

      const createdItems = [];
      for (const item of items) {
        const createdItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            qty: item.qty,
            unitPrice: item.unitPrice,
          },
        });
        createdItems.push(createdItem);
      }

      return {
        ...order,
        items: createdItems,
      };
    });

    return this.toDomain(record);
  }

  async findByUserId(
    userId: number,
    params: {
      status?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ orders: Order[]; totalCount: number }> {
    const whereClause: any = { userId };
    
    if (params.status) {
      whereClause.status = params.status as any;
    }

    const [records, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: params.skip,
        take: params.take,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    return {
      orders: records.map((r) => this.toDomain(r)),
      totalCount,
    };
  }
}
