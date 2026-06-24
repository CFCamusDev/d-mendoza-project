export * from './search.types';

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  price: number | string;
  discountPercent: number;
  attributesJson: Record<string, string>;
  isActive: boolean;
  minStock?: number;
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
  outOfStock: boolean;
  product: {
    id: number;
    name: string;
    description?: string;
    images: Array<{
      id: number;
      productId: number;
      url: string;
      isMain: boolean;
    }>;
    category?: {
      id: number;
      name: string;
    };
    brand?: {
      id: number;
      name: string;
    };
  };
  salesInLast30Days?: number;
}
