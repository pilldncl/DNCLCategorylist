export interface CatalogItem {
  id: string;
  brand: string;
  name: string;
  grade: string;
  minQty: number;
  price: number;
  description?: string;
  category?: string;
  image?: string;
}

export interface CatalogFilters {
  brand?: string;
  grade?: string;
  search?: string;
}

export interface CatalogResponse {
  items: CatalogItem[];
}
