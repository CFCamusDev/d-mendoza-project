import React, { useState } from 'react';
import type { Order } from '../types';
import { OrderTimeline } from './OrderTimeline';
import { orderService } from '../services/order.service';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  RotateCcw
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await orderService.downloadOrderReceiptPdf(order.id);
      toast.success('Comprobante descargado');
    } catch (err: any) {
      toast.error(err.message || 'Error al descargar el comprobante');
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header Info */}
      <div className="bg-gray-50/75 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-2 md:flex md:items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">ID Pedido</p>
            <p className="font-extrabold text-gray-800 mt-0.5">#{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fecha de Compra</p>
            <div className="flex items-center gap-1.5 text-gray-700 font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Facturado</p>
            <p className="font-black text-brand-accent mt-0.5">S/ {order.total.toFixed(2)}</p>
          </div>
          {order.shippingCost > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Costo Envío</p>
              <p className="font-semibold text-gray-600 mt-0.5">S/ {order.shippingCost.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Return Request Button or Status Badge */}
          {order.status === 'DELIVERED' && (
            <>
              {!order.returnRequests || order.returnRequests.length === 0 ? (
                <Link
                  to={`/profile/orders/${order.id}/return`}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-brand-primary/30 hover:border-brand-accent rounded-xl text-xs font-bold text-[#3F3F3F] hover:text-brand-accent bg-white transition-all shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Solicitar Devolución</span>
                </Link>
              ) : (
                (() => {
                  const req = order.returnRequests[0];
                  let badgeClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                  let label = 'Devolución Pendiente';

                  if (req.status === 'APPROVED') {
                    badgeClass = 'bg-green-50 text-green-700 border-green-200';
                    label = 'Devolución Aprobada';
                  } else if (req.status === 'REJECTED') {
                    badgeClass = 'bg-red-50 text-red-700 border-red-200';
                    label = 'Devolución Rechazada';
                  }

                  return (
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-xl text-[10px] font-extrabold tracking-wide uppercase shadow-sm ${badgeClass}`}>
                      <RotateCcw className="w-3 h-3" />
                      {label}
                    </span>
                  );
                })()
              )}
            </>
          )}

          {/* Action Button: PDF receipt */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-700 hover:text-black bg-white transition-all shadow-sm disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Comprobante PDF</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timeline Status */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estado del Pedido</h4>
          <OrderTimeline order={order} />
        </div>

        {/* Address & Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
          {/* Address Snapshot */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Dirección de Envío
            </h4>
            <div className="text-sm text-gray-700 bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
              <p className="font-bold text-gray-800">{order.addressSnapshot.alias}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.addressSnapshot.fullAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.addressSnapshot.district}
                {order.addressSnapshot.reference && ` • Ref: ${order.addressSnapshot.reference}`}
              </p>
            </div>
          </div>

          {/* Toggle Items view */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setShowItems(!showItems)}
              className="flex items-center justify-between w-full px-5 py-3 border border-gray-100 hover:border-gray-200 bg-gray-50/20 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-gray-400" />
                <span>Productos en este pedido ({order.items.reduce((acc, item) => acc + item.qty, 0)})</span>
              </div>
              {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Products Items List dropdown */}
        {showItems && (
          <div className="pt-4 border-t border-gray-100 animate-fadeIn">
            <div className="bg-gray-50/30 border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="px-5 py-3">Producto</th>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3 text-center">Cant.</th>
                    <th className="px-5 py-3 text-right">Precio Unit.</th>
                    <th className="px-5 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/40">
                      <td className="px-5 py-3.5 font-bold text-gray-900">{item.productName}</td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-gray-400">{item.variantSku}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-gray-800">{item.qty}</td>
                      <td className="px-5 py-3.5 text-right">S/ {item.unitPrice.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900">S/ {(item.qty * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
