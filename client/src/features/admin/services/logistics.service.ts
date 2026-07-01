import axiosInstance from '@/shared/api/axiosInstance';
import type { Delivery, PickingResponse, AssignDeliveryManResponse } from '../types/logistics.types';

export const logisticsService = {
  /**
   * Genera una lista de picking agrupando todas las órdenes que tienen estado PAID 
   * y que no cuentan con un despacho (Delivery) asociado.
   */
  generatePickingList: async (): Promise<Delivery[]> => {
    const { data } = await axiosInstance.post<PickingResponse>('/v1/logistics/picking');
    return data.data; // Return the array of Deliveries
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
