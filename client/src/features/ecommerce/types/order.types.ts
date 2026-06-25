export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface AddressSnapshot {
  alias: string;
  fullAddress: string;
  district: string;
  reference?: string;
}

export interface OrderItem {
  id: number;
  variantId: number;
  qty: number;
  unitPrice: number;
  variantSku: string;
  productName: string;
}

export interface OrderStatusLog {
  id: number;
  orderId: number;
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  shippingCost: number;
  addressSnapshot: AddressSnapshot;
  paymentIntentId?: string | null;
  createdAt: string;
  items: OrderItem[];
  statusLogs?: OrderStatusLog[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
