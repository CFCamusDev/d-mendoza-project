export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface PickingItem {
  id: number;
  deliveryId: number;
  variantId: number;
  qty: number;
  pickedAt?: Date | null;
  variantSku?: string;
  productName?: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryManId?: number | null;
  status: DeliveryStatus;
  pickingItems?: PickingItem[];
  createdAt: Date;
  updatedAt: Date;
}
