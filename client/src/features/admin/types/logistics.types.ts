export interface PickingItem {
  id: number;
  deliveryId: number;
  variantId: number;
  qty: number;
  pickedAt: string | null;
  variantSku: string;
  productName: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryManId: number | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED' | 'RETURNED';
  createdAt: string;
  updatedAt: string;
  pickingItems: PickingItem[];
}

export interface PickingResponse {
  success: boolean;
  count: number;
  data: Delivery[];
}

export interface AssignDeliveryManResponse {
  success: boolean;
  data: Delivery;
}

// Para mock data y UI state
export interface OrderToPick {
  id: number;
  orderId: number;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DeliveryMan {
  id: number;
  name: string;
  email: string;
}
