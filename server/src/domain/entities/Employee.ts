export interface Employee {
  id: number;
  name: string;
  dni: string;
  isActive: boolean;
  userId?: number | null;
  branchId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDTO {
  name: string;
  dni: string;
  branchId: number;
  userId?: number | null;
}

export interface UpdateEmployeeDTO {
  name?: string;
  branchId?: number;
}
