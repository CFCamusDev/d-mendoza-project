import prisma from '@infrastructure/database/prisma';

export class KardexService {
  /**
   * T-101: Calcula el Costo Promedio Ponderado (CPP) para una variante en una sucursal.
   * Se recalcula al registrar cada ENTRADA y se guarda como unitCost del asiento.
   *
   * CPP = (stockAnterior * costoAnterior + cantidadEntrada * costoEntrada)
   *       / (stockAnterior + cantidadEntrada)
   */
  async calcularCostoPromedioPonderado(
    variantId: number,
    branchId: number,
    cantidadEntrada: number,
    costoEntrada: number
  ): Promise<number> {
    const stock = await prisma.branchStock.findUnique({
      where: { variantId_branchId: { variantId, branchId } },
    });

    const lastEntry = await prisma.kardexEntry.findFirst({
      where: { variantId, branchId, type: 'ENTRADA' },
      orderBy: { createdAt: 'desc' },
    });

    const stockActual = stock?.quantity ?? 0;
    const costoActual = lastEntry?.unitCost ?? 0;

    if (stockActual <= 0) return costoEntrada;

    const cpp = (stockActual * costoActual + cantidadEntrada * costoEntrada)
      / (stockActual + cantidadEntrada);

    return Math.round(cpp * 100) / 100;
  }

  /**
   * Registra una ENTRADA con CPP recalculado y actualiza BranchStock.
   */
  async registrarEntrada(args: {
    variantId: number;
    branchId: number;
    quantity: number;
    unitCost: number;
  }): Promise<void> {
    const cpp = await this.calcularCostoPromedioPonderado(
      args.variantId,
      args.branchId,
      args.quantity,
      args.unitCost
    );

    await prisma.$transaction(async tx => {
      const stock = await tx.branchStock.upsert({
        where: { variantId_branchId: { variantId: args.variantId, branchId: args.branchId } },
        create: { variantId: args.variantId, branchId: args.branchId, quantity: args.quantity },
        update: { quantity: { increment: args.quantity } },
      });

      const lastEntry = await tx.kardexEntry.findFirst({
        where: { variantId: args.variantId, branchId: args.branchId },
        orderBy: { createdAt: 'desc' },
      });

      await tx.kardexEntry.create({
        data: {
          variantId: args.variantId,
          branchId: args.branchId,
          type: 'ENTRADA',
          quantity: args.quantity,
          unitCost: cpp,
          balanceQty: stock.quantity,
          balanceCost: (lastEntry?.balanceCost ?? 0) + args.quantity * cpp,
        },
      });
    });
  }

  /**
   * Registra una SALIDA y actualiza BranchStock.
   */
  async registrarSalida(args: {
    variantId: number;
    branchId: number;
    quantity: number;
  }): Promise<void> {
    await prisma.$transaction(async tx => {
      const stock = await tx.branchStock.findUnique({
        where: { variantId_branchId: { variantId: args.variantId, branchId: args.branchId } },
      });

      if (!stock || stock.quantity < args.quantity) {
        throw new Error('Stock insuficiente para registrar salida');
      }

      const lastEntry = await tx.kardexEntry.findFirst({
        where: { variantId: args.variantId, branchId: args.branchId },
        orderBy: { createdAt: 'desc' },
      });

      const unitCost = lastEntry?.unitCost ?? 0;
      const newQty = stock.quantity - args.quantity;

      await tx.branchStock.update({
        where: { variantId_branchId: { variantId: args.variantId, branchId: args.branchId } },
        data: { quantity: newQty },
      });

      await tx.kardexEntry.create({
        data: {
          variantId: args.variantId,
          branchId: args.branchId,
          type: 'SALIDA',
          quantity: args.quantity,
          unitCost,
          balanceQty: newQty,
          balanceCost: (lastEntry?.balanceCost ?? 0) - args.quantity * unitCost,
        },
      });
    });
  }
}
