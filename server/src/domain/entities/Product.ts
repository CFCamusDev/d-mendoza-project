export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isMain: boolean;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  categoryId: number;
  brandId: number;
  gender: string | null;
  isActive: boolean;
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
