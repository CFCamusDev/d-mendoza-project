import { useState, useCallback } from 'react';
import { logisticsService } from '../services/logistics.service';
import { Delivery, OrderToPick } from '../types/logistics.types';
import toast from 'react-hot-toast';

export const usePicking = () => {
  const [orders, setOrders] = useState<OrderToPick[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MOCK: Obtener pedidos listos (estado PAID)
  // Como la API no especifica un endpoint para listar pedidos listos para picking, lo mockeamos
  const fetchPendingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simular llamada de red
      await new Promise(res => setTimeout(res, 500));
      setOrders([
        { id: 1, orderId: 1001, customerName: 'Juan Perez', itemsCount: 3, totalAmount: 150.0, status: 'PAID', createdAt: new Date().toISOString() },
        { id: 2, orderId: 1002, customerName: 'Maria Lopez', itemsCount: 1, totalAmount: 45.5, status: 'PAID', createdAt: new Date().toISOString() },
      ]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePickingList = async () => {
    setIsGenerating(true);
    try {
      // POST /api/v1/logistics/picking
      const newDeliveries = await logisticsService.generatePickingList();
      
      // En la vida real, los orders seleccionados ya fueron procesados, así que los vaciamos de la lista
      setOrders([]);
      
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
