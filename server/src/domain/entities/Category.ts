export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  isActive: boolean;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  parentId?: number | null;
}
