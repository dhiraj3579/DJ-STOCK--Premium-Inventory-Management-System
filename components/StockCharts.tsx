
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Product } from '../types';
import { CATEGORIES } from '../constants.tsx';

interface StockChartsProps {
  products: Product[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const StockCharts: React.FC<StockChartsProps> = ({ products }) => {
  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).reduce((acc, p) => acc + p.stockLevel, 0)
  })).filter(d => d.value > 0);

  const valuationData = CATEGORIES.map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).reduce((acc, p) => acc + (p.stockLevel * p.price), 0)
  })).filter(d => d.value > 0);

  const topStockData = [...products]
    .sort((a, b) => b.stockLevel - a.stockLevel)
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
      stock: p.stockLevel
    }));

  return (
    <div className="space-y-8 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Stock Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Capital Valuation (₹)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Top Inventory Assets</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStockData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="stock" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StockCharts;
