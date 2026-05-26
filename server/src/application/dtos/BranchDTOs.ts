export interface CreateBranchRequestDTO {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateBranchRequestDTO {
  name?: string;
  address?: string | null;
  phone?: string | null;
}

export interface BranchResponseDTO {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  warehouse?: {
    id: number;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
