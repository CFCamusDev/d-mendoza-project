import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { orderService } from '../services/order.service';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { Order } from '../types';
import { ReturnItemSelector } from './components/ReturnItemSelector';

export const ReturnRequestPage: React.FC = () => {
  useDocumentTitle('Solicitud de Devolución - D\'Mendoza');
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state: orderItemId -> quantity to return
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const id = Number(orderId);
        if (isNaN(id)) {
          throw new Error('ID de pedido inválido.');
        }

        // Fetch user orders and find the matching one
        const data = await orderService.fetchUserOrders({ limit: 100 });
        const foundOrder = data.orders.find((o) => o.id === id);

        if (!foundOrder) {
          throw new Error('Pedido no encontrado en tu historial.');
        }

        if (foundOrder.status !== 'DELIVERED') {
          throw new Error('Solo se pueden solicitar devoluciones de pedidos entregados.');
        }

        setOrder(foundOrder);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del pedido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSelectItem = (orderItemId: number, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) {
        // Default to returning 1 item
        next[orderItemId] = 1;
      } else {
        delete next[orderItemId];
      }
      return next;
    });
  };

  const handleChangeQty = (orderItemId: number, qty: number) => {
    setSelectedItems((prev) => {
      if (prev[orderItemId] === undefined) return prev;
      return {
        ...prev,
        [orderItemId]: qty,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-brand-primary/30 shadow-sm min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent mb-2" />
        <p className="text-xs text-brand-text font-semibold">Cargando información del pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-red-800">No se puede solicitar la devolución</h3>
            <p className="text-xs text-red-600 mt-1">{error || 'Pedido no disponible.'}</p>
          </div>
          <Link
            to="/profile/orders"
            className="mt-2 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all shadow-sm"
          >
            Ir a mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl p-6 border border-brand-primary/30 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-brand-accent">
            Solicitar Devolución del Pedido #{order.id}
          </h2>
          <p className="text-xs text-brand-text mt-1">
            Selecciona los productos que deseas devolver y cuéntanos el motivo.
          </p>
        </div>

        <ReturnItemSelector
          items={order.items}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onChangeQty={handleChangeQty}
        />

        {/* Placeholder form for next phase */}
        <div className="p-4 bg-brand-primary/5 rounded-2xl border border-dashed border-brand-primary/30">
          <p className="text-xs text-brand-text font-semibold text-center italic">
            El formulario de motivo y tipo de devolución se integrará en la siguiente fase.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ReturnRequestPage;
