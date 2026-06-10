import prisma from '@infrastructure/database/prisma';
import bcrypt from 'bcrypt';

interface CancelSaleDTO {
  orderId: number;
  userId: number;
  userRole: string;
  adminEmail?: string;
  adminPassword?: string;
}

interface CancelSaleResult {
  orderId: number;
  status: 'CANCELLED';
  itemsReversed: number;
  cancelledAt: Date;
}

export class CancelSaleUseCase {
  async execute(dto: CancelSaleDTO): Promise<CancelSaleResult> {
    // 1. Obtener la orden con sus ítems
    const order = await prisma.posOrder.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new Error(`La venta con ID ${dto.orderId} no existe`);
    }

    if (order.status !== 'COMPLETED') {
      throw new Error(`Solo se pueden anular ventas completadas. Estado actual: ${order.status}`);
    }

    // 2. Verificar permisos
    if (dto.userRole !== 'ADMIN') {
      // Vendedor necesita credenciales de un admin
      if (!dto.adminEmail || !dto.adminPassword) {
        throw new Error('Se requiere autorización de un administrador para anular esta venta');
      }

      // Verificar que las credenciales correspondan a un admin
      const adminUser = await prisma.user.findUnique({
        where: { email: dto.adminEmail },
        include: { roles: true },
      });

      if (!adminUser) {
        throw new Error('Las credenciales de administrador no son válidas');
      }

      const isAdmin = adminUser.roles.some((role) => role.name === 'ADMIN');
      if (!isAdmin) {
        throw new Error('El usuario proporcionado no tiene rol de administrador');
      }

      const isPasswordValid = await bcrypt.compare(dto.adminPassword, adminUser.password);
      if (!isPasswordValid) {
        throw new Error('Las credenciales de administrador no son válidas');
      }
    }

    // 3. Ejecutar anulación en transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // A) Cambiar estado a CANCELLED
      await tx.posOrder.update({
        where: { id: dto.orderId },
        data: { status: 'CANCELLED' },
      });

      // B) Revertir stock y generar Kardex ENTRADA por cada ítem
      for (const item of order.items) {
        // Incrementar stock
        await tx.branchStock.update({
          where: {
            variantId_branchId: {
              variantId: item.variantId,
              branchId: order.branchId,
            },
          },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });

        // Generar Kardex ENTRADA (reversión)
        const lastKardex = await tx.kardexEntry.findFirst({
          where: { variantId: item.variantId, branchId: order.branchId },
          orderBy: { id: 'desc' },
        });

        const currentUnitCost = lastKardex ? lastKardex.balanceCost : 0;
        const currentBalanceQty = lastKardex ? lastKardex.balanceQty : 0;
        const newBalanceQty = currentBalanceQty + item.quantity;

        await tx.kardexEntry.create({
          data: {
            variantId: item.variantId,
            branchId: order.branchId,
            type: 'ENTRADA',
            quantity: item.quantity,
            unitCost: currentUnitCost,
            balanceQty: newBalanceQty,
            balanceCost: currentUnitCost,
          },
        });
      }

      return {
        orderId: dto.orderId,
        status: 'CANCELLED' as const,
        itemsReversed: order.items.length,
        cancelledAt: new Date(),
      };
    });

    return result;
  }
}
