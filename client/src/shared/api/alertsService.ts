import axiosInstance from './axiosInstance';

export interface PendingOrderAlert {
  id: number;
  orderId: number;
  isActive: boolean;
  createdAt: string;
}

export interface PendingOrderAlertsResponse {
  success: boolean;
  count: number;
  alerts: PendingOrderAlert[];
}

export const alertsService = {
  getPendingOrdersAlerts: async (): Promise<PendingOrderAlertsResponse> => {
    const { data } = await axiosInstance.get<PendingOrderAlertsResponse>('/v1/admin/alerts/pending-orders');
    return data;
  }
};
