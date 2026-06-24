export interface CreateBranchRequestDTO {
  name: string;
  address?: string;
  phone?: string;
  isMain?: boolean;
}

export interface UpdateBranchRequestDTO {
  name?: string;
  address?: string | null;
  phone?: string | null;
  isMain?: boolean;
}

export interface BranchResponseDTO {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  isMain: boolean;
  warehouse?: {
    id: number;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
