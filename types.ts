
export type Category = 'Electronics' | 'Apparel' | 'Home' | 'Office' | 'Food' | 'Other';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  stockLevel: number;
  price: number;
  lowStockThreshold: number;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  timestamp: number;
  note?: string;
}

export interface InventoryState {
  products: Product[];
  transactions: Transaction[];
}
