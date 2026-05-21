export interface Client {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  documentId?: string | null;
  userId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDTO {
  email: string;
  name: string;
  phone?: string;
  documentId?: string;
}
