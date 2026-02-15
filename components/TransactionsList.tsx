
import React from 'react';
import { Transaction } from '../types';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl h-full flex flex-col">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Live Activity</h3>
      </div>
      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto flex-1">
        {sorted.length > 0 ? (
          sorted.map((t) => (
            <div key={t.id} className="p-5 hover:bg-white/[0.02] transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{t.productName}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-widest ${
                  t.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  t.type === 'OUT' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {t.type}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span className={t.quantity > 0 ? 'text-emerald-500/80' : 'text-orange-500/80'}>
                   {t.quantity > 0 ? `+${t.quantity}` : t.quantity} units
                </span>
                <span className="opacity-50 tracking-tighter">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Feed Standby</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
