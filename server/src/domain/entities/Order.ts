export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  qty: number;
  unitPrice: number;
  variantSku?: string;
  productName?: string;
}

export interface OrderStatusLog {
  id: number;
  orderId: number;
  status: OrderStatus;
  changedAt: Date;
  changedBy: string;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  shippingCost: number;
  addressSnapshot: any;
  paymentIntentId: string;
  user?: { id: number; name: string; email: string };
  items?: OrderItem[];
  statusLogs?: OrderStatusLog[];
  createdAt: Date;
  updatedAt: Date;
}

