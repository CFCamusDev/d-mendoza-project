import { ProductVariant } from './ProductVariant';

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isMain: boolean;
  createdAt: Date;
}

export interface Product {
  id: number;
  code: string;        // Código base para auto-SKU (ej. "CAM")
  name: string;
  description: string | null;
  categoryId: number | null;
  brandId?: number;
  gender?: string | null;
  isActive: boolean;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description?: string | null;
  categoryId: number;
  brandId: number;
  gender?: string | null;
}
