import PDFDocument from 'pdfkit';
import { IShippingLabelService, ShippingLabelData } from '@domain/services/IShippingLabelService';

export class PdfKitShippingLabelService implements IShippingLabelService {
  async generateLabelPdfStream(data: ShippingLabelData): Promise<NodeJS.ReadableStream> {
    // Standard A6 size is perfect for shipping labels (105 x 148 mm)
    const doc = new PDFDocument({ margin: 20, size: 'A6' });

    // Outer border to simulate a real label
    doc.rect(10, 10, 278, 399).strokeColor('#3F3F3F').lineWidth(2).stroke();

    // Header
    doc.fillColor('#3F3F3F')
       .fontSize(16)
       .text("D'MENDOZA", 20, 20, { align: 'center' });
       
    doc.fontSize(8)
       .fillColor('#6B6B6B')
       .text("DESPACHO / LOGÍSTICA", 20, 38, { align: 'center' });

    // Horizontal line
    doc.moveTo(10, 50).lineTo(288, 50).strokeColor('#3F3F3F').lineWidth(1).stroke();

    // Tracking Code Section
    doc.fontSize(8)
       .fillColor('#6B6B6B')
       .text("CÓDIGO DE ENVÍO", 20, 60);

    doc.fontSize(14)
       .fillColor('#3F3F3F')
       .text(data.trackingCode, 20, 72, { align: 'left' });

    // Draw barcode placeholder
    // We can draw a simple representation of a 1D barcode using lines of random widths
    let startX = 20;
    const barcodeY = 95;
    const barcodeHeight = 35;
    const barPattern = [1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 2, 1, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1];
    doc.strokeColor('#000000');
    barPattern.forEach((width, index) => {
      if (index % 2 === 0) {
        doc.moveTo(startX, barcodeY)
           .lineTo(startX, barcodeY + barcodeHeight)
           .lineWidth(width)
           .stroke();
      }
      startX += width + 1;
    });

    // Horizontal line
    doc.moveTo(10, 145).lineTo(288, 145).strokeColor('#3F3F3F').lineWidth(1).stroke();

    // Recipient Details
    doc.fontSize(8)
       .fillColor('#6B6B6B')
       .text("DESTINATARIO", 20, 155);

    doc.fontSize(11)
       .fillColor('#3F3F3F')
       .text(data.recipientName, 20, 167);

    // Horizontal line
    doc.moveTo(10, 195).lineTo(288, 195).strokeColor('#3F3F3F').lineWidth(1).stroke();

    // Address Details
    doc.fontSize(8)
       .fillColor('#6B6B6B')
       .text("DIRECCIÓN DE ENTREGA", 20, 205);

    doc.fontSize(9)
       .fillColor('#3F3F3F')
       .text(data.fullAddress, 20, 217, { width: 250 });

    // Horizontal line
    doc.moveTo(10, 290).lineTo(288, 290).strokeColor('#3F3F3F').lineWidth(1).stroke();

    // District Details
    doc.fontSize(8)
       .fillColor('#6B6B6B')
       .text("DISTRITO / ZONA", 20, 300);

    doc.fontSize(12)
       .fillColor('#3F3F3F')
       .text(data.district.toUpperCase(), 20, 312);

    // Footer note
    doc.fontSize(6)
       .fillColor('#6B6B6B')
       .text("Por favor, verifique el contenido del paquete antes de firmar la entrega.", 20, 380, { align: 'center', width: 250 });

    doc.end();
    return doc;
  }
}
