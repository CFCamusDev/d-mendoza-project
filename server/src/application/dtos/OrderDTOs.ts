export interface ListOrdersInputDTO {
  userId: number;
  status?: string;
  page: number;
  limit: number;
}

export interface OrderItemResponseDTO {
  id: number;
  variantId: number;
  qty: number;
  unitPrice: number;
  variantSku?: string;
  productName?: string;
}

export interface OrderStatusLogDTO {
  id: number;
  status: string;
  changedAt: Date;
  changedBy: string;
}

export interface OrderResponseDTO {
  id: number;
  status: string;
  total: number;
  shippingCost: number;
  addressSnapshot: any;
  paymentIntentId: string;
  createdAt: Date;
  items?: OrderItemResponseDTO[];
  statusLogs?: OrderStatusLogDTO[];
}


export interface ListOrdersResponseDTO {
  orders: OrderResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
