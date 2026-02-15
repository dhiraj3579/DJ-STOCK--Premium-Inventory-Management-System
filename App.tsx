
import React, { useState, useEffect } from 'react';
import { Product, Transaction, InventoryState, TransactionType } from './types';
import { loadState, saveState, createId } from './services/inventoryService';
import { Icons } from './constants.tsx';
import StatsCards from './components/StatsCards';
import InventoryTable from './components/InventoryTable';
import TransactionsList from './components/TransactionsList';
import ProductModal from './components/ProductModal';
import Scanner from './components/Scanner';

const App: React.FC = () => {
  const [state, setState] = useState<InventoryState>(loadState());
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTransaction = (productId: string, productName: string, type: TransactionType, quantity: number, note?: string) => {
    const newTransaction: Transaction = {
      id: createId(),
      productId,
      productName,
      type,
      quantity,
      timestamp: Date.now(),
      note,
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions].slice(0, 100),
    }));
  };

  const handleSaveProduct = (formData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.id === editingProduct.id ? { ...formData, id: p.id } : p
        )
      }));
      addTransaction(editingProduct.id, formData.name, 'ADJUSTMENT', 0, 'Details updated');
    } else {
      const newProduct: Product = { ...formData, id: createId() };
      setState(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
      addTransaction(newProduct.id, newProduct.name, 'IN', newProduct.stockLevel, 'Initial stock');
    }
    setIsProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      const product = state.products.find(p => p.id === id);
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
      if (product) addTransaction(id, product.name, 'OUT', -product.stockLevel, 'Product deleted');
    }
  };

  const handleUpdateStock = (id: string, amount: number) => {
    setState(prev => {
      const products = prev.products.map(p => {
        if (p.id === id) {
          const newLevel = Math.max(0, p.stockLevel + amount);
          if (newLevel !== p.stockLevel) {
            addTransaction(p.id, p.name, amount > 0 ? 'IN' : 'OUT', amount);
          }
          return { ...p, stockLevel: newLevel };
        }
        return p;
      });
      return { ...prev, products };
    });
  };

  const handleScan = (sku: string) => {
    const product = state.products.find(p => p.sku.toUpperCase() === sku.toUpperCase());
    if (product) {
      handleUpdateStock(product.id, 1);
    } else {
      alert(`No product found for SKU: ${sku}`);
    }
    setIsScannerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      {/* Premium Header */}
      <header className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20 transform rotate-3">
              DJ
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              STOCK<span className="text-indigo-500">.</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Icons.Scan /> Scanner
            </button>
            <button 
              onClick={() => {
                setEditingProduct(undefined);
                setIsProductModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 border border-indigo-400/20"
            >
              <Icons.Plus /> <span className="hidden sm:inline">New Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10">
        <StatsCards products={state.products} />

        {/* Fancy Mobile Tabs */}
        <div className="flex md:hidden bg-slate-800/50 p-1.5 rounded-2xl mb-8 border border-white/5">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <Icons.Package /> Stock
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <Icons.History /> Activity
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className={`lg:col-span-3 ${activeTab === 'history' ? 'hidden md:block' : ''}`}>
            <InventoryTable 
              products={state.products} 
              onEdit={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }} 
              onDelete={handleDeleteProduct}
              onUpdateStock={handleUpdateStock}
            />
          </div>

          <div className={`lg:col-span-1 ${activeTab === 'inventory' ? 'hidden md:block' : ''}`}>
            <TransactionsList transactions={state.transactions} />
          </div>
        </div>
      </main>

      <button 
        onClick={() => setIsScannerOpen(true)}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 active:scale-90 transition-transform z-40 border border-white/10"
      >
        <Icons.Scan />
      </button>

      {isProductModalOpen && (
        <ProductModal 
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(undefined);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {isScannerOpen && (
        <Scanner 
          onScan={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      <footer className="mt-auto py-10 border-t border-white/5 bg-[#0b1120]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold gap-6">
          <p>© 2024 DJ STOCK ENTERPRISE. LUXURY EDITION.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div> 
              SECURE CLOUD ACTIVE
            </span>
            <span className="text-indigo-400">VERIFIED SYSTEM v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
