// ─── HU-051 T-091: Implementación Prisma del repositorio de Ingreso de Mercadería ──

import prisma from '@infrastructure/database/prisma';
import {
  IStockEntryRepository,
  CreateStockEntryDTO,
} from '@domain/repositories/IStockEntryRepository';
import { StockEntry, StockEntryItem } from '@domain/entities/StockEntry';
import {
  StockEntry as PrismaStockEntry,
  StockEntryItem as PrismaStockEntryItem,
  Supplier as PrismaSupplier,
} from '@prisma/client';

type StockEntryWithRelations = PrismaStockEntry & {
  supplier: PrismaSupplier;
  items: PrismaStockEntryItem[];
};

export class PrismaStockEntryRepository implements IStockEntryRepository {
  /**
   * Registra el ingreso de mercadería en una transacción atómica:
   *  1. Crea el registro StockEntry con sus items
   *  2. Actualiza (upsert) el BranchStock por variante
   *  3. Genera el asiento ENTRADA en el Kardex
   */
  async create(data: CreateStockEntryDTO): Promise<StockEntry> {
    const record = await prisma.$transaction(async (tx) => {
      // 1. Crear cabecera y detalle del ingreso
      const stockEntry = await tx.stockEntry.create({
        data: {
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          branchId: data.branchId,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            })),
          },
        },
        include: {
          supplier: true,
          items: true,
        },
      });

      // 2. Por cada ítem: actualizar BranchStock y generar asiento Kardex
      for (const item of data.items) {
        // Obtener el último asiento del kardex para calcular saldo acumulado
        const lastKardex = await tx.kardexEntry.findFirst({
          where: { variantId: item.variantId, branchId: data.branchId },
          orderBy: { createdAt: 'desc' },
        });

        const prevBalanceQty = lastKardex?.balanceQty ?? 0;
        const prevBalanceCost = lastKardex?.balanceCost ?? 0;
        const newBalanceQty = prevBalanceQty + item.quantity;
        const newBalanceCost = prevBalanceCost + item.quantity * item.unitCost;

        // Upsert del stock en sucursal
        await tx.branchStock.upsert({
          where: { variantId_branchId: { variantId: item.variantId, branchId: data.branchId } },
          create: { variantId: item.variantId, branchId: data.branchId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });

        // Asiento ENTRADA en Kardex
        await tx.kardexEntry.create({
          data: {
            variantId: item.variantId,
            branchId: data.branchId,
            type: 'ENTRADA',
            quantity: item.quantity,
            unitCost: item.unitCost,
            balanceQty: newBalanceQty,
            balanceCost: newBalanceCost,
          },
        });
      }

      return stockEntry;
    });

    return this.toDomain(record);
  }

  async findById(id: number): Promise<StockEntry | null> {
    const record = await prisma.stockEntry.findUnique({
      where: { id },
      include: { supplier: true, items: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<StockEntry[]> {
    const records = await prisma.stockEntry.findMany({
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: StockEntryWithRelations): StockEntry {
    return {
      id: record.id,
      supplierId: record.supplierId,
      invoiceNumber: record.invoiceNumber,
      branchId: record.branchId,
      supplier: {
        id: record.supplier.id,
        ruc: record.supplier.ruc,
        razonSocial: record.supplier.razonSocial,
        contacto: record.supplier.contacto,
        direccion: record.supplier.direccion,
        isActive: record.supplier.isActive,
        createdAt: record.supplier.createdAt,
        updatedAt: record.supplier.updatedAt,
      },
      items: record.items.map((item): StockEntryItem => ({
        id: item.id,
        stockEntryId: item.stockEntryId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
