
import React, { useState } from 'react';
import { Product } from '../types';
import { Icons, CATEGORIES } from '../constants.tsx';

interface InventoryTableProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, amount: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onDelete, onUpdateStock }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stockLevel <= p.lowStockThreshold;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Stock Level', 'Price', 'Threshold'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.sku,
      p.category,
      p.stockLevel,
      p.price,
      p.lowStockThreshold
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5 flex flex-col gap-6 bg-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Vault Inventory</h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">Managing all registered SKU entities</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-sm text-white placeholder-slate-500 transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-sm text-white transition-all appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-bold ${
              showLowStockOnly 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <Icons.Alert />
            {showLowStockOnly ? 'Showing Low Stock' : 'Filter Low Stock'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2 px-4 pb-4">
          <thead>
            <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="px-4 py-4">Asset Identification</th>
              <th className="px-4 py-4">Registry</th>
              <th className="px-4 py-4">Classification</th>
              <th className="px-4 py-4">Availability</th>
              <th className="px-4 py-4">Unit Value</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isLowStock = p.stockLevel <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="bg-white/[0.03] hover:bg-white/[0.08] transition-all group rounded-2xl overflow-hidden">
                    <td className="px-4 py-5 first:rounded-l-2xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{p.name}</span>
                        {isLowStock && (
                          <span className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase mt-1 tracking-wider">
                            <Icons.Alert /> DEPLETED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-xs text-slate-400 font-mono tracking-tighter opacity-70">#{p.sku}</td>
                    <td className="px-4 py-5">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-white/5 text-slate-400 border border-white/5 uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-black tabular-nums ${isLowStock ? 'text-red-500' : 'text-white'}`}>
                          {p.stockLevel}
                        </span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90">
                          <button 
                            onClick={() => onUpdateStock(p.id, -1)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14"/></svg>
                          </button>
                          <button 
                            onClick={() => onUpdateStock(p.id, 1)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14m-7-7h14"/></svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm text-slate-300 font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-5 text-right last:rounded-r-2xl">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEdit(p)}
                          className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button 
                          onClick={() => onDelete(p.id)}
                          className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                     <div className="p-4 bg-white/5 rounded-full text-slate-600">
                        <Icons.Search />
                     </div>
                     <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No matching assets identified</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
