import prisma from '@infrastructure/database/prisma';

export interface CreateStockTransferDTO {
  fromBranchId: number;
  toBranchId: number;
  variantId: number;
  quantity: number;
}

export class CreateStockTransferUseCase {
  async execute(dto: CreateStockTransferDTO) {
    const { fromBranchId, toBranchId, variantId, quantity } = dto;

    // 1. Validaciones previas a la transacción
    if (quantity <= 0) {
      const err = new Error('La cantidad a transferir debe ser mayor a cero');
      (err as any).statusCode = 400;
      throw err;
    }

    if (fromBranchId === toBranchId) {
      const err = new Error('La sucursal de origen y destino no pueden ser la misma');
      (err as any).statusCode = 400;
      throw err;
    }

    // Validar origen y destino
    const [fromBranch, toBranch, variant] = await Promise.all([
      prisma.branch.findUnique({ where: { id: fromBranchId } }),
      prisma.branch.findUnique({ where: { id: toBranchId } }),
      prisma.productVariant.findUnique({ where: { id: variantId } }),
    ]);

    if (!fromBranch || !fromBranch.isActive) {
      const err = new Error('La sucursal de origen no existe o se encuentra inactiva');
      (err as any).statusCode = 404;
      throw err;
    }

    if (!toBranch || !toBranch.isActive) {
      const err = new Error('La sucursal de destino no existe o se encuentra inactiva');
      (err as any).statusCode = 404;
      throw err;
    }

    if (!variant || !variant.isActive) {
      const err = new Error('La variante del producto no existe o se encuentra inactiva');
      (err as any).statusCode = 404;
      throw err;
    }

    // 2. Transacción de base de datos
    return await prisma.$transaction(async (tx) => {
      // Validar stock disponible en la sucursal de origen
      const sourceStock = await tx.branchStock.findUnique({
        where: { variantId_branchId: { variantId, branchId: fromBranchId } },
      });

      if (!sourceStock || sourceStock.quantity < quantity) {
        const err = new Error(`Stock insuficiente en la sucursal de origen. Stock disponible: ${sourceStock?.quantity ?? 0}`);
        (err as any).statusCode = 400;
        throw err;
      }

      // --- SUCURSAL DE ORIGEN (SALIDA) ---
      // Decrementar stock de origen
      const updatedSourceStock = await tx.branchStock.update({
        where: { variantId_branchId: { variantId, branchId: fromBranchId } },
        data: { quantity: { decrement: quantity } },
      });

      // Obtener último asiento Kardex de origen
      const lastEntryOrigin = await tx.kardexEntry.findFirst({
        where: { variantId, branchId: fromBranchId },
        orderBy: { createdAt: 'desc' },
      });

      const originUnitCost = lastEntryOrigin?.unitCost ?? 0;
      const originBalanceCost = lastEntryOrigin?.balanceCost ?? 0;

      // Crear asiento Kardex SALIDA
      await tx.kardexEntry.create({
        data: {
          variantId,
          branchId: fromBranchId,
          type: 'SALIDA',
          quantity,
          unitCost: originUnitCost,
          balanceQty: updatedSourceStock.quantity,
          balanceCost: originBalanceCost - (quantity * originUnitCost),
        },
      });

      // --- SUCURSAL DE DESTINO (ENTRADA) ---
      // Obtener stock actual de destino
      const destStock = await tx.branchStock.findUnique({
        where: { variantId_branchId: { variantId, branchId: toBranchId } },
      });

      const currentDestQty = destStock?.quantity ?? 0;

      // Obtener último asiento Kardex de destino
      const lastEntryDest = await tx.kardexEntry.findFirst({
        where: { variantId, branchId: toBranchId },
        orderBy: { createdAt: 'desc' },
      });

      const lastUnitCostDest = lastEntryDest?.unitCost ?? 0;

      // El stock transferido ingresa al costo de salida de la sucursal de origen
      const transferUnitCost = originUnitCost;

      // Calcular CPP para el destino
      let cppDest = transferUnitCost;
      if (currentDestQty > 0) {
        cppDest = ((currentDestQty * lastUnitCostDest) + (quantity * transferUnitCost)) / (currentDestQty + quantity);
        cppDest = Math.round(cppDest * 100) / 100;
      }

      // Incrementar stock en destino
      const updatedDestStock = await tx.branchStock.upsert({
        where: { variantId_branchId: { variantId, branchId: toBranchId } },
        create: { variantId, branchId: toBranchId, quantity },
        update: { quantity: { increment: quantity } },
      });

      // Crear asiento Kardex ENTRADA
      await tx.kardexEntry.create({
        data: {
          variantId,
          branchId: toBranchId,
          type: 'ENTRADA',
          quantity,
          unitCost: cppDest,
          balanceQty: updatedDestStock.quantity,
          balanceCost: (lastEntryDest?.balanceCost ?? 0) + (quantity * cppDest),
        },
      });

      // --- REGISTRO DE LA TRANSFERENCIA ---
      const transfer = await tx.stockTransfer.create({
        data: {
          fromBranchId,
          toBranchId,
          variantId,
          quantity,
          status: 'CONFIRMED',
        },
        include: {
          fromBranch: true,
          toBranch: true,
          variant: true,
        },
      });

      return transfer;
    });
  }
}
