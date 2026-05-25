import { ProductVariant } from './ProductVariant';

// Entidad de dominio: Product
// HU-014 — T-076
export interface Product {
  id: number;
  code: string;        // Código base para auto-SKU (ej. "CAM")
  name: string;
  description?: string | null;
  categoryId?: number | null;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}
