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
  code: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number | null;
  brandId?: number | null;
  gender?: string | null;
  model?: string | null;
  isActive: boolean;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  code: string;
  name: string;
  slug?: string;
  description?: string | null;
  categoryId: number;
  brandId: number;
  gender?: string | null;
  model?: string | null;
}
