export interface PosProduct {
  variantId: number;
  productId: number;
  sku: string;
  name: string;
  baseName: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface CartItem {
  variantId: number;
  productId: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  attributes: Record<string, string>;
}
