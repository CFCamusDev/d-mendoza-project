import React from 'react';
import type { Delivery, DeliveryMan } from '../../types/logistics.types';
import { X, FileText, MapPin, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { getStatusStyle } from '../../../../shared/utils/statusColors';

interface DeliveryDetailPanelProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  deliveryMen: DeliveryMan[];
  onDownloadLabel: (deliveryId: number) => void;
  assigningId: number | null;
}

export const DeliveryDetailPanel: React.FC<DeliveryDetailPanelProps> = ({
  delivery,
  isOpen,
  onClose,
  deliveryMen,
  onDownloadLabel,
  assigningId
}) => {
  if (!isOpen || !delivery) return null;

  const statusStyle = getStatusStyle(delivery.status);
  const driver = deliveryMen.find(m => m.id === delivery.deliveryManId);

  // Parse addressSnapshot json
  let addressDetails = {
    alias: '',
    address: 'No especificado',
    reference: '',
    district: '',
    department: '',
    province: ''
  };

  if (delivery.orderAddress) {
    try {
      addressDetails = typeof delivery.orderAddress === 'string'
        ? JSON.parse(delivery.orderAddress)
        : delivery.orderAddress;
    } catch (e) {
      console.error('Error parsing address snapshot', e);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-gray-100 shadow-2xl flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base">Detalle de Envío</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: #{delivery.id}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Section */}
        <div className={`p-4 rounded-2xl border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.glow} flex justify-between items-center`}>
          <div>
            <span className="text-[9px] font-black uppercase opacity-60">Estado del envío</span>
            <h4 className={`text-sm font-extrabold uppercase ${statusStyle.text}`}>{statusStyle.label}</h4>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${statusStyle.badge}`}>
            {delivery.status}
          </span>
        </div>

        {/* Client & Order section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Datos del Pedido</span>
          </h4>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/20 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Pedido ID:</span>
              <span className="font-bold text-gray-900">#{delivery.orderId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Cliente:</span>
              <span className="font-bold text-gray-900">{delivery.orderUser?.name || 'Cliente D\'Mendoza'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Email:</span>
              <span className="font-semibold text-gray-700">{delivery.orderUser?.email || 'No disponible'}</span>
            </div>
          </div>
        </div>

        {/* Address section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Dirección de Entrega</span>
          </h4>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/20 space-y-3">
            <div className="text-xs">
              <span className="text-gray-500 font-semibold block mb-0.5">Dirección:</span>
              <span className="font-bold text-gray-900 block leading-relaxed">
                {addressDetails.address}
              </span>
            </div>
            {(addressDetails.district || addressDetails.department) && (
              <div className="text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Distrito:</span>
                  <span className="font-bold text-gray-900 block">{addressDetails.district}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Región:</span>
                  <span className="font-bold text-gray-900 block">{addressDetails.department}</span>
                </div>
              </div>
            )}
            {addressDetails.reference && (
              <div className="text-xs p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <span className="text-amber-700 font-black text-[9px] uppercase tracking-wider block mb-0.5">Referencia:</span>
                <span className="text-amber-800 font-semibold text-xs leading-relaxed">{addressDetails.reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Repartidor section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Repartidor Asignado</span>
          </h4>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/20">
            {driver ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{driver.name}</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">{driver.email}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Ningún repartidor asignado a este envío todavía.</span>
              </div>
            )}
          </div>
        </div>

        {/* Items section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Prendas a Enviar</span>
          </h4>
          <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
            {delivery.pickingItems?.map((item) => (
              <div key={item.id} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50/50 transition-colors gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-900 block truncate">{item.productName || 'Prenda'}</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">SKU: {item.variantSku || 'N/A'}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                    Cant: {item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer (Download label) */}
      {delivery.deliveryManId && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={() => onDownloadLabel(delivery.id)}
            disabled={assigningId === delivery.id}
            className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-xl shadow-black/10 hover:shadow-black/25 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar Guía de Envío</span>
          </button>
        </div>
      )}
    </div>
  );
};
