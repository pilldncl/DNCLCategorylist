import { CatalogItem } from './catalog';

export interface CartItem {
  product: CatalogItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

