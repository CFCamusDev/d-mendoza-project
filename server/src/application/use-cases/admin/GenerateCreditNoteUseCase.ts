import prisma from '@infrastructure/database/prisma';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export class GenerateCreditNoteUseCase {
  async execute(returnRequestId: number): Promise<any> {
    const returnReq = await prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
      include: {
        order: { include: { user: true } },
        items: { include: { orderItem: { include: { variant: true } } } },
        user: true,
      },
    });

    if (!returnReq) {
      throw new Error(`Solicitud de devolución con ID ${returnRequestId} no encontrada`);
    }

    if (returnReq.status === 'APPROVED') {
      throw new Error(`La solicitud ya ha sido aprobada`);
    }

    const existingNote = await prisma.creditNote.findUnique({
      where: { returnRequestId },
    });

    if (existingNote) {
      throw new Error(`Ya existe una nota de crédito para esta solicitud`);
    }

    const mainBranch = await prisma.branch.findFirst({
      where: { isMain: true },
    });

    if (!mainBranch) {
      throw new Error(`No se encontró la sucursal principal para ingresar el stock`);
    }

    // Calcula el monto basado en los items devueltos
    let totalAmount = 0;
    for (const item of returnReq.items) {
      const unitPrice = parseFloat(item.orderItem.unitPrice.toString());
      totalAmount += unitPrice * item.qty;
    }

    const uniqueCode = `CN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const creditNote = await prisma.$transaction(async (tx) => {
      // 1. Crear Nota
      const note = await tx.creditNote.create({
        data: {
          code: uniqueCode,
          returnRequestId,
          type: returnReq.refundType === 'CREDIT_NOTE' ? 'CREDIT_NOTE' : 'STORE_CREDIT',
          amount: totalAmount,
        },
      });

      // 2. Actualizar estado de devolución
      await tx.returnRequest.update({
        where: { id: returnRequestId },
        data: { status: 'APPROVED' },
      });

      // 3. Devolver stock a la sucursal principal
      for (const item of returnReq.items) {
        const variantId = item.orderItem.variantId;
        const qty = item.qty;

        // Upsert stock
        const currentStock = await tx.branchStock.findUnique({
          where: {
            variantId_branchId_status: {
              variantId,
              branchId: mainBranch.id,
              status: 'AVAILABLE',
            },
          },
        });

        if (currentStock) {
          await tx.branchStock.update({
            where: { id: currentStock.id },
            data: { quantity: currentStock.quantity + qty },
          });
        } else {
          await tx.branchStock.create({
            data: {
              variantId,
              branchId: mainBranch.id,
              quantity: qty,
              status: 'AVAILABLE',
            },
          });
        }

        // 4. Kardex
        // Necesitamos calcular el unitCost. Para simplificar, usaremos el unitPrice del orderItem
        await tx.kardexEntry.create({
          data: {
            variantId,
            branchId: mainBranch.id,
            type: 'ENTRADA',
            quantity: qty,
            unitCost: parseFloat(item.orderItem.unitPrice.toString()),
            balanceQty: (currentStock?.quantity || 0) + qty,
            balanceCost: parseFloat(item.orderItem.unitPrice.toString()),
          },
        });
      }

      return note;
    });

    // Generate PDF Buffer
    const pdfBuffer = await this.generatePDF(creditNote, returnReq.user, totalAmount);

    // Send Email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: returnReq.user.email,
        subject: `Tu Nota de Crédito ${creditNote.code}`,
        html: `<p>Hola ${returnReq.user.name},</p><p>Adjuntamos tu nota de crédito generada por la devolución de tu pedido #${returnReq.orderId}.</p><p>Monto a favor: S/ ${totalAmount.toFixed(2)}</p>`,
        attachments: [
          {
            filename: `${creditNote.code}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (e) {
      console.error('Error al enviar correo', e);
      // We don't fail the transaction if email fails, just log it.
    }

    return creditNote;
  }

  private generatePDF(note: any, user: any, amount: number): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc
        .fontSize(20)
        .text('Nota de Crédito', { align: 'center' })
        .moveDown();

      doc
        .fontSize(12)
        .text(`Código: ${note.code}`)
        .text(`Fecha: ${note.createdAt.toLocaleDateString()}`)
        .text(`Cliente: ${user.name} ${user.lastName || ''}`)
        .text(`Monto: S/ ${amount.toFixed(2)}`)
        .moveDown();

      doc.text('Este documento sirve como comprobante de saldo a su favor.', { align: 'center' });

      doc.end();
    });
  }
}
