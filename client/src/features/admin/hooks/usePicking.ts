import { useState, useCallback } from 'react';
import { logisticsService } from '../services/logistics.service';
import type { Delivery, OrderToPick } from '../types/logistics.types';
import toast from 'react-hot-toast';

export const usePicking = () => {
  const [orders, setOrders] = useState<OrderToPick[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getPendingOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePickingList = async (orderIds?: number[]) => {
    setIsGenerating(true);
    try {
      // POST /api/v1/logistics/picking con orderIds en body
      const newDeliveries = await logisticsService.generatePickingList(orderIds);
      
      if (orderIds && orderIds.length > 0) {
        // Eliminar de la tabla solo los pedidos que se procesaron
        setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
      } else {
        // Si fue masivo, vaciar todas las órdenes
        setOrders([]);
      }
      
      // Añadimos los nuevos despachos generados a nuestra tabla local
      setDeliveries((prev) => [...newDeliveries, ...prev]);
      toast.success('Picking lists generados con éxito.');
      return newDeliveries;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error al generar el picking list';
      toast.error(`Error: ${msg}`);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    orders,
    deliveries,
    setDeliveries,
    isLoading,
    isGenerating,
    error,
    fetchPendingOrders,
    generatePickingList,
  };
};
