
import React from 'react';
import { Product } from '../types';
import { LOW_STOCK_LIMIT } from '../constants.tsx';

interface StatsCardsProps {
  products: Product[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stockLevel), 0);
  const lowStockCount = products.filter(p => p.stockLevel <= LOW_STOCK_LIMIT).length;
  const totalStock = products.reduce((acc, p) => acc + p.stockLevel, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-indigo-500/30 transition-all">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Portfolio Value</p>
        <h3 className="text-3xl font-extrabold text-white mt-2 group-hover:scale-105 transition-transform origin-left">
          ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-sm font-medium text-slate-500 ml-1">.00</span>
        </h3>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 w-fit px-2 py-1 rounded-full">
          {products.length} SKU ASSETS
        </div>
      </div>
      
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-blue-500/30 transition-all">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Unit Volume</p>
        <h3 className="text-3xl font-extrabold text-white mt-2 group-hover:scale-105 transition-transform origin-left">
          {totalStock.toLocaleString('en-IN')}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-full uppercase">
          Healthy Flux
        </div>
      </div>

      <div className={`p-8 rounded-[2rem] border backdrop-blur-md shadow-2xl transition-all group ${lowStockCount > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-[#1e293b]/50 border-white/5'}`}>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Attention Required</p>
        <h3 className={`text-3xl font-extrabold mt-2 group-hover:scale-105 transition-transform origin-left ${lowStockCount > 0 ? 'text-red-500' : 'text-white'}`}>
          {lowStockCount}
        </h3>
        <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold w-fit px-2 py-1 rounded-full uppercase ${lowStockCount > 0 ? 'text-red-400 bg-red-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
          {lowStockCount > 0 ? 'CRITICAL DEPLETION' : 'SUPPLY OPTIMIZED'}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
