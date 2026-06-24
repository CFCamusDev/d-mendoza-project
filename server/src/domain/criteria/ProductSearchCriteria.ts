export interface ProductSearchCriteria {
  query?: string;
  categoryId?: number;
  brandId?: number;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  branchId?: number;
  cursor?: number;
  limit?: number;
  orderBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
}
