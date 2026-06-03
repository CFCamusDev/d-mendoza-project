import { Request, Response } from 'express';
import prisma from '@infrastructure/database/prisma';
import { CancelSaleUseCase } from '@application/use-cases/pos/CancelSaleUseCase';

const cancelSaleUseCase = new CancelSaleUseCase();

export class SaleController {
  async processSale(req: Request, res: Response) {
    try {
      const { items, subtotal, discountTotal, total, payments, branchId } = req.body;
      const userId = req.auth?.userId;

      // 1. Validaciones básicas
      if (!items || !items.length || !payments || !payments.length || !branchId) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos obligatorios (items, payments, branchId).',
        });
      }

      // Validar que la suma de pagos cubra el total
      const paymentsSum = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      if (paymentsSum < total) {
        return res.status(400).json({
          success: false,
          error: `El pago (S/. ${paymentsSum.toFixed(2)}) no cubre el total (S/. ${total.toFixed(2)}).`,
        });
      }

      // 2. Transacción
      const result = await prisma.$transaction(async (tx) => {
        // A) Validar Stock
        for (const item of items) {
          const branchStock = await tx.branchStock.findUnique({
            where: {
              variantId_branchId: {
                variantId: item.variantId,
                branchId,
              },
            },
          });

          if (!branchStock || branchStock.quantity < item.quantity) {
            throw new Error(`Stock insuficiente para el producto/variante ID ${item.variantId}. Disponible: ${branchStock?.quantity || 0}, Requerido: ${item.quantity}.`);
          }
        }

        // B) Crear Venta (PosOrder) y sus Ítems
        const order = await tx.posOrder.create({
          data: {
            branchId,
            userId,
            subtotal,
            discountTotal,
            total,
            status: 'COMPLETED',
            items: {
              create: items.map((item: any) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountAmount: item.discountAmount || 0,
                lineTotal: (item.unitPrice * item.quantity) - (item.discountAmount || 0),
              })),
            },
          },
        });

        // C) Crear Pagos (Solo guardamos el monto exacto cobrado a la deuda)
        let remainingTotal = total;
        const paymentsToCreate = [];

        for (const p of payments) {
          if (remainingTotal <= 0) break;

          const amountToCharge = Math.min(Number(p.amount), remainingTotal);
          paymentsToCreate.push({
            posOrderId: order.id,
            method: p.method, // 'CASH', 'CARD', 'TRANSFER', 'YAPE'
            amount: amountToCharge,
          });
          remainingTotal -= amountToCharge;
        }

        await tx.payment.createMany({
          data: paymentsToCreate,
        });

        // D) Descontar Stock y Generar Kardex
        for (const item of items) {
          // Descontar
          await tx.branchStock.update({
            where: {
              variantId_branchId: {
                variantId: item.variantId,
                branchId,
              },
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });

          // Kardex
          const lastKardex = await tx.kardexEntry.findFirst({
            where: { variantId: item.variantId, branchId },
            orderBy: { id: 'desc' },
          });

          const currentUnitCost = lastKardex ? lastKardex.balanceCost : 0;
          const currentBalanceQty = lastKardex ? lastKardex.balanceQty : 0;
          const newBalanceQty = currentBalanceQty - item.quantity;

          await tx.kardexEntry.create({
            data: {
              variantId: item.variantId,
              branchId,
              type: 'SALIDA',
              quantity: item.quantity,
              unitCost: currentUnitCost,
              balanceQty: newBalanceQty,
              balanceCost: currentUnitCost,
            },
          });
        }

        return order;
      });

      return res.status(201).json({
        success: true,
        data: result,
      });

    } catch (error: any) {
      console.error('[SaleController] Error procesando venta:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Error procesando la venta.',
      });
    }
  }

  /**
   * PATCH /api/v1/pos/sales/:id/cancel
   * Anula una venta y revierte el stock y kardex.
   * - ADMIN: puede anular directamente.
   * - SELLER: requiere credenciales de un administrador (adminEmail + adminPassword).
   */
  async cancelSale(req: Request, res: Response) {
    try {
      const orderId = parseInt(String(req.params.id), 10);
      if (isNaN(orderId)) {
        return res.status(400).json({ success: false, error: 'El ID de la venta debe ser un número entero' });
      }

      const userId = req.auth?.userId;
      const userRole = req.auth?.role;
      if (!userId || !userRole) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
      }

      const { adminEmail, adminPassword } = req.body || {};

      const result = await cancelSaleUseCase.execute({
        orderId,
        userId,
        userRole,
        adminEmail,
        adminPassword,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error('[SaleController] Error anulando venta:', error);

      if (error.message?.includes('no existe')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message?.includes('autorización') || error.message?.includes('credenciales') || error.message?.includes('administrador')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      if (error.message?.includes('Solo se pueden')) {
        return res.status(409).json({ success: false, error: error.message });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Error al anular la venta.',
      });
    }
  }

  async getReceiptData(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.posOrder.findUnique({
        where: { id: Number(id) },
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
          payments: true,
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Orden de venta no encontrada.',
        });
      }

      // Fetch user separately because relation might not be defined in PosOrder schema
      let sellerName = 'Vendedor';
      if (order.userId) {
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { name: true, lastName: true },
        });
        if (user) {
          sellerName = `${user.name} ${user.lastName || ''}`.trim();
        }
      }

      // Calculamos totales y organizamos datos para el recibo
      const totalPagado = order.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const efectivoTotal = order.payments
        .filter((p: any) => p.method === 'CASH')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      
      const change = Math.max(0, efectivoTotal - (Number(order.total) - (totalPagado - efectivoTotal)));

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          date: order.createdAt,
          seller: sellerName,
          branch: order.branch,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.variant.product.name,
            sku: item.variant.sku,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            discountAmount: Number(item.discountAmount),
            lineTotal: Number(item.lineTotal),
            // TODO: Cross-branch logic if needed
            isCrossBranch: false 
          })),
          totals: {
            subtotal: Number(order.subtotal),
            discountTotal: Number(order.discountTotal),
            total: Number(order.total),
            paid: totalPagado,
            change: change,
          },
          payments: order.payments.map((p: any) => ({
            method: p.method,
            amount: Number(p.amount),
          })),
        },
      });
    } catch (error: any) {
      console.error('[SaleController] Error obteniendo recibo:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener el comprobante de venta.',
      });
    }
  }
}
