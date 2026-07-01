import prisma from '@infrastructure/database/prisma';
import { DeliveryStateMachine } from '@domain/services/DeliveryStateMachine';

export class ReturnDeliveryUseCase {
  async execute(deliveryId: number): Promise<any> {
    // Buscar el delivery y su orden relacionada
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          include: {
            items: true
          }
        }
      }
    });

    if (!delivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found`);
    }

    // Validar la transición de estado
    DeliveryStateMachine.validateTransition(delivery.status, 'RETURNED');

    // Realizar la reincorporación dentro de una transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado del Delivery
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: 'RETURNED' }
      });

      // 2. Actualizar estado de la Orden
      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: 'RETURNED' }
      });

      // Registrar OrderStatusLog
      await tx.orderStatusLog.create({
        data: {
          orderId: delivery.orderId,
          status: 'RETURNED',
          changedBy: 'SYSTEM (Delivery Returned)'
        }
      });

      // 3. Obtener la sucursal principal (Main Branch)
      let mainBranch = await tx.branch.findFirst({
        where: { isMain: true, isActive: true }
      });

      if (!mainBranch) {
        mainBranch = await tx.branch.findFirst({
          where: { isActive: true },
          orderBy: { id: 'asc' }
        });
      }

      if (!mainBranch) {
        throw new Error('No se encontró ninguna sucursal activa para reincorporar el stock');
      }

      // 4. Reincorporar stock e insertar Kardex
      for (const item of delivery.order.items) {
        // a. Buscar el stock actual para el variant
        let stock = await tx.branchStock.findUnique({
          where: {
            variantId_branchId_status: {
              variantId: item.variantId,
              branchId: mainBranch.id,
              status: 'AVAILABLE'
            }
          }
        });

        if (!stock) {
          // Si por alguna razón no existiera, lo creamos
          stock = await tx.branchStock.create({
            data: {
              variantId: item.variantId,
              branchId: mainBranch.id,
              status: 'AVAILABLE',
              quantity: 0
            }
          });
        }

        const newQty = Number(stock.quantity) + item.qty;

        // Incrementar el stock
        await tx.branchStock.update({
          where: { id: stock.id },
          data: { quantity: newQty }
        });

        // b. Generar asiento en Kardex (ENTRADA)
        // Obtener el último costo unitario (o usar el precio de venta si no hay, aunque debería haber costo)
        const lastKardex = await tx.kardexEntry.findFirst({
          where: { variantId: item.variantId, branchId: mainBranch.id },
          orderBy: { id: 'desc' }
        });

        const unitCost = lastKardex?.unitCost ?? 0;
        const lastBalanceCost = lastKardex?.balanceCost ?? 0;
        const newBalanceCost = lastBalanceCost + (item.qty * unitCost);

        await tx.kardexEntry.create({
          data: {
            variantId: item.variantId,
            branchId: mainBranch.id,
            type: 'ENTRADA',
            quantity: item.qty,
            unitCost,
            balanceQty: newQty,
            balanceCost: newBalanceCost
          }
        });
      }

      return updatedDelivery;
    });

    return result;
  }
}
