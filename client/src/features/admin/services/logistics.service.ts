import axiosInstance from '@/shared/api/axiosInstance';
  import type { Delivery, PickingResponse, AssignDeliveryManResponse, OrderToPick } from '../types/logistics.types';

export const logisticsService = {
  /**
   * Obtiene la lista de pedidos pagados sin despacho asociado desde el backend
   */
  getPendingOrders: async (): Promise<OrderToPick[]> => {
    const { data } = await axiosInstance.get<{ success: boolean; data: OrderToPick[] }>('/v1/logistics/orders/pending');
    return data.data;
  },

  /**
   * Genera una lista de picking agrupando todas las órdenes que tienen estado PAID 
   * y que no cuentan con un despacho (Delivery) asociado. Permite enviar orderIds.
   */
  generatePickingList: async (orderIds?: number[]): Promise<Delivery[]> => {
    const { data } = await axiosInstance.post<PickingResponse>('/v1/logistics/picking', { orderIds });
    return data.data;
  },

  /**
   * Obtiene la lista de despachos generados (Deliveries), con opción de filtrar por status
   */
  getDeliveries: async (status?: string): Promise<Delivery[]> => {
    const { data } = await axiosInstance.get<{ success: boolean; data: Delivery[] }>('/v1/logistics/deliveries', {
      params: { status }
    });
    return data.data;
  },

  /**
   * Asigna un repartidor a un despacho existente
   */
  assignDeliveryMan: async (deliveryId: number, deliveryManId: number): Promise<Delivery> => {
    const { data } = await axiosInstance.post<AssignDeliveryManResponse>(`/v1/logistics/deliveries/${deliveryId}/assign`, {
      deliveryManId
    });
    return data.data;
  },

  /**
   * Descarga la etiqueta de despacho en PDF
   */
  downloadShippingLabel: async (deliveryId: number): Promise<void> => {
    const response = await axiosInstance.get(`/v1/logistics/deliveries/${deliveryId}/label`, {
      responseType: 'blob'
    });
    
    // Create a Blob from the PDF Stream
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    
    // Create an anchor link and trigger download
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `shipping-label-${deliveryId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
