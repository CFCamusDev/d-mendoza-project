export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  shippingCost: number;
  addressSnapshot: any; // Stored as Json snapshot
  paymentIntentId: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
