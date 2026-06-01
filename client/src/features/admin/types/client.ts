/**
 * Representa un cliente del sistema POS para vinculación e-commerce.
 */
export interface Client {
  id: number;
  email: string;
  name: string;
  phone?: string;
  documentId?: string;
  userId?: number | null;
}
