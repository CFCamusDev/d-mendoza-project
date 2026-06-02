import React from 'react';
import { useBrand } from '@/shared/context/BrandContext';

export interface ReceiptData {
  orderId: number;
  date: string;
  seller: string;
  branch: {
    id: number;
    name: string;
    address: string;
    phone: string | null;
  };
  items: {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    lineTotal: number;
    isCrossBranch?: boolean;
  }[];
  totals: {
    subtotal: number;
    discountTotal: number;
    total: number;
    paid: number;
    change: number;
  };
  payments: {
    method: string;
    amount: number;
  }[];
}

interface ReceiptProps {
  data: ReceiptData | null;
}

export const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  const { brandConfig } = useBrand();

  if (!data) return null;

  return (
    <div className="hidden print:block text-black bg-white p-4 font-mono text-sm max-w-[80mm] mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4">
        {brandConfig?.logoHorizontalUrl ? (
          <img 
            src={brandConfig.logoHorizontalUrl} 
            alt={brandConfig.brandName} 
            className="h-10 mx-auto object-contain mb-2 grayscale" 
          />
        ) : (
          <h1 className="text-2xl font-black uppercase mb-1">{brandConfig?.brandName || "D'MENDOZA"}</h1>
        )}
        <h2 className="text-lg font-bold uppercase">{data.branch.name}</h2>
        {data.branch.address && <p className="text-xs">{data.branch.address}</p>}
        {data.branch.phone && <p className="text-xs">Tel: {data.branch.phone}</p>}
        <p className="text-xs mt-2 border-b border-dashed border-gray-400 pb-2 font-bold">
          Comprobante: #{data.orderId.toString().padStart(6, '0')}
        </p>
      </div>

      {/* Meta Info */}
      <div className="text-xs mb-4">
        <p>Fecha: {new Date(data.date).toLocaleString('es-PE')}</p>
        <p>Atendido por: {data.seller}</p>
      </div>

      {/* Items */}
      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="text-left pb-1">CANT</th>
            <th className="text-left pb-1">DESC.</th>
            <th className="text-right pb-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 align-top">{item.quantity}</td>
              <td className="py-1 pr-2">
                {item.name}
                {item.isCrossBranch && <span className="ml-1 text-xs font-bold">[EXT]</span>}
                {item.discountAmount > 0 && (
                  <div className="text-[10px] italic">
                    Desc: -S/. {item.discountAmount.toFixed(2)}
                  </div>
                )}
              </td>
              <td className="py-1 align-top text-right">
                {item.lineTotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="text-xs mb-4 border-t border-dashed border-gray-400 pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>S/. {data.totals.subtotal.toFixed(2)}</span>
        </div>
        {data.totals.discountTotal > 0 && (
          <div className="flex justify-between">
            <span>Descuento:</span>
            <span>-S/. {data.totals.discountTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>S/. {data.totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payments */}
      <div className="text-xs mb-4 border-t border-dashed border-gray-400 pt-2 space-y-1">
        {data.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between">
            <span>PAGO ({p.method}):</span>
            <span>S/. {p.amount.toFixed(2)}</span>
          </div>
        ))}
        {data.totals.change > 0 && (
          <div className="flex justify-between font-bold mt-1">
            <span>VUELTO:</span>
            <span>S/. {data.totals.change.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-6 space-y-2">
        <p className="font-bold">¡Gracias por su compra!</p>
        <p>Vuelva pronto</p>
        
        <div className="border-t border-dashed border-gray-400 mt-4 pt-3 pb-2 text-[10px] leading-tight text-justify">
          Este comprobante no tiene validez fiscal. Es un documento informativo emitido para el control interno y verificación del cliente, y no sustituye la factura o boleta electrónica correspondiente.
        </div>
      </div>
    </div>
  );
};
