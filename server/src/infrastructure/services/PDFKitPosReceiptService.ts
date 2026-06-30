import PDFDocument from 'pdfkit';
import { PosReceiptData } from '@application/use-cases/admin/GetPosReceiptPdfUseCase';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  YAPE: 'Yape',
};

export class PDFKitPosReceiptService {
  generate(receipt: PosReceiptData): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const gray = '#6B6B6B';
    const dark = '#3F3F3F';
    const divider = '#D9D9D2';

    // ── Cabecera: marca ────────────────────────────────────────────────────────
    doc.fillColor(dark).fontSize(24).text("D'MENDOZA", 50, 50, { align: 'left' });
    doc.fontSize(10).fillColor(gray)
       .text("D'Mendoza S.A.C.", 50, 80)
       .text('RUC: 20609876543', 50, 95)
       .text(`Sucursal: ${receipt.branch.name}`, 50, 110)
       .text(receipt.branch.address || 'Lima, Perú', 50, 125);

    // ── Cabecera: datos del comprobante ────────────────────────────────────────
    doc.fillColor(dark).fontSize(14)
       .text('COMPROBANTE DE VENTA POS', 300, 50, { align: 'right' });

    const fecha = receipt.createdAt instanceof Date
      ? receipt.createdAt.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date(receipt.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const hora = receipt.createdAt instanceof Date
      ? receipt.createdAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      : new Date(receipt.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    doc.fontSize(10).fillColor(gray)
       .text(`N° Venta: #${receipt.orderId}`, 300, 75, { align: 'right' })
       .text(`Fecha: ${fecha}  ${hora}`, 300, 90, { align: 'right' })
       .text(`Estado: ${receipt.status}`, 300, 105, { align: 'right' });

    if (receipt.isCrossBranch && receipt.sourceBranch) {
      doc.text(`Transferencia desde: ${receipt.sourceBranch.name}`, 300, 120, { align: 'right' });
    }

    // ── Línea divisora ─────────────────────────────────────────────────────────
    doc.moveTo(50, 148).lineTo(545, 148).strokeColor(divider).stroke();

    // ── Vendedor / Cliente ─────────────────────────────────────────────────────
    let infoY = 160;

    if (receipt.seller) {
      doc.fillColor(dark).fontSize(11).text('VENDEDOR', 50, infoY);
      doc.fontSize(10).fillColor(gray)
         .text(`${receipt.seller.name} ${receipt.seller.lastName || ''}`.trim(), 50, infoY + 16)
         .text(receipt.seller.email, 50, infoY + 31);
    }

    if (receipt.client) {
      doc.fillColor(dark).fontSize(11).text('CLIENTE', 300, infoY);
      const docLabel = receipt.client.documentType || 'Doc.';
      doc.fontSize(10).fillColor(gray)
         .text(`${receipt.client.name} ${receipt.client.lastName || ''}`.trim(), 300, infoY + 16)
         .text(`${docLabel}: ${receipt.client.documentId || '—'}`, 300, infoY + 31);
    }

    // ── Línea divisora ─────────────────────────────────────────────────────────
    const tableStart = receipt.seller || receipt.client ? 215 : 165;
    doc.moveTo(50, tableStart).lineTo(545, tableStart).strokeColor(divider).stroke();

    // ── Encabezado tabla de ítems ──────────────────────────────────────────────
    const headerY = tableStart + 12;
    doc.fillColor(dark).fontSize(10)
       .text('Producto', 50, headerY, { width: 180 })
       .text('SKU', 235, headerY, { width: 90 })
       .text('Cant.', 330, headerY, { width: 40, align: 'right' })
       .text('P.Unit.', 375, headerY, { width: 60, align: 'right' })
       .text('Desc.', 440, headerY, { width: 45, align: 'right' })
       .text('Total', 490, headerY, { width: 55, align: 'right' });

    doc.moveTo(50, headerY + 15).lineTo(545, headerY + 15).strokeColor(dark).stroke();

    // ── Ítems ──────────────────────────────────────────────────────────────────
    let y = headerY + 25;

    for (const item of receipt.items) {
      doc.fillColor(gray).fontSize(9)
         .text(item.productName, 50, y, { width: 180 })
         .text(item.sku, 235, y, { width: 90 })
         .text(item.quantity.toString(), 330, y, { width: 40, align: 'right' })
         .text(`S/ ${item.unitPrice.toFixed(2)}`, 375, y, { width: 60, align: 'right' })
         .text(item.discountAmount > 0 ? `-S/ ${item.discountAmount.toFixed(2)}` : '—', 440, y, { width: 45, align: 'right' })
         .text(`S/ ${item.lineTotal.toFixed(2)}`, 490, y, { width: 55, align: 'right' });

      y += 18;
      if (y > 720) { doc.addPage(); y = 50; }
    }

    // ── Línea cierre tabla ─────────────────────────────────────────────────────
    doc.moveTo(50, y + 6).lineTo(545, y + 6).strokeColor(divider).stroke();
    y += 18;

    // ── Totales ────────────────────────────────────────────────────────────────
    doc.fillColor(dark).fontSize(10)
       .text('Subtotal:', 370, y, { width: 110, align: 'right' })
       .text(`S/ ${receipt.subtotal.toFixed(2)}`, 490, y, { width: 55, align: 'right' });

    if (receipt.discountTotal > 0) {
      y += 16;
      doc.text('Descuento:', 370, y, { width: 110, align: 'right' })
         .fillColor('#B91C1C')
         .text(`-S/ ${receipt.discountTotal.toFixed(2)}`, 490, y, { width: 55, align: 'right' });
    }

    y += 16;
    doc.fillColor(dark).fontSize(12)
       .text('TOTAL:', 370, y, { width: 110, align: 'right' })
       .text(`S/ ${receipt.total.toFixed(2)}`, 490, y, { width: 55, align: 'right' });

    // ── Métodos de pago ────────────────────────────────────────────────────────
    if (receipt.payments.length > 0) {
      y += 28;
      doc.fillColor(dark).fontSize(10).text('Pagado con:', 50, y);
      y += 14;
      for (const pago of receipt.payments) {
        const label = PAYMENT_METHOD_LABELS[pago.method] || pago.method;
        doc.fillColor(gray).fontSize(9)
           .text(`${label}: S/ ${pago.amount.toFixed(2)}`, 60, y);
        y += 14;
      }
    }

    // ── Pie de página ──────────────────────────────────────────────────────────
    doc.fontSize(8).fillColor(gray)
       .text("¡Gracias por su compra en D'Mendoza!", 50, 760, { align: 'center', width: 495 })
       .text('Este documento es un comprobante digital y no tiene valor tributario.', 50, 772, { align: 'center', width: 495 });

    doc.end();
    return doc;
  }
}
