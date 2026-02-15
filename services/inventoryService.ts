
import { Product, Transaction, InventoryState } from '../types';

const STORAGE_KEY = 'omni_stock_v1';

const INITIAL_DATA: InventoryState = {
  products: [
    { id: '1', name: 'Dell UltraSharp Monitor', sku: 'DELL-24-U', category: 'Electronics', stockLevel: 12, price: 299.99, lowStockThreshold: 5 },
    { id: '2', name: 'Ergonomic Office Chair', sku: 'CHAIR-ERG-01', category: 'Office', stockLevel: 3, price: 450.00, lowStockThreshold: 5 },
    { id: '3', name: 'MacBook Pro 14"', sku: 'MBP-14-M2', category: 'Electronics', stockLevel: 8, price: 1999.00, lowStockThreshold: 5 },
    { id: '4', name: 'Organic Coffee Beans', sku: 'FOOD-COF-01', category: 'Food', stockLevel: 2, price: 18.50, lowStockThreshold: 5 },
  ],
  transactions: []
};

export const loadState = (): InventoryState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : INITIAL_DATA;
};

export const saveState = (state: InventoryState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createId = () => Math.random().toString(36).substr(2, 9);
