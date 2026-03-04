
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES, Icons } from '../constants.tsx';

interface ProductModalProps {
  product?: Product;
  initialSku?: string;
  onSave: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
  onScanRequest?: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, initialSku, onSave, onClose, onScanRequest }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: initialSku || '',
    category: 'Electronics' as Category,
    stockLevel: 0,
    price: 0,
    lowStockThreshold: 5,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        stockLevel: product.stockLevel,
        price: product.price,
        lowStockThreshold: product.lowStockThreshold,
      });
    } else if (initialSku) {
      setFormData(prev => ({ ...prev, sku: initialSku }));
    }
  }, [product, initialSku]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyle = "w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all font-bold text-sm shadow-inner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1e293b] w-full max-w-xl rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {product ? 'Asset Modification' : 'New Asset Entry'}
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">Update the master database</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Asset Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputStyle}
                placeholder="PRO-GRADE PRODUCT NAME"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Serial ID / SKU</label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className={inputStyle + " pr-14"}
                  placeholder="SERIAL-000"
                />
                {onScanRequest && !product && (
                  <button
                    type="button"
                    onClick={onScanRequest}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 group-hover:border-indigo-500/50"
                    title="Scan Barcode"
                  >
                    <Icons.Scan />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Classification</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className={inputStyle + " appearance-none cursor-pointer"}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Asset Value (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Initial Reserve</label>
              <input
                required
                type="number"
                min="0"
                value={formData.stockLevel}
                onChange={(e) => setFormData({ ...formData, stockLevel: parseInt(e.target.value) })}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border border-white/5 text-slate-400 font-black uppercase tracking-widest hover:bg-white/5 transition-all text-sm"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-500 transition-all text-sm shadow-xl shadow-indigo-600/20"
            >
              {product ? 'Commit Changes' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
