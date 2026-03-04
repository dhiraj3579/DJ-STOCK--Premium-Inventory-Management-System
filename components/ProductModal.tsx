
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Product, Category } from '../types';
import { CATEGORIES, Icons } from '../constants.tsx';
import { GoogleGenAI, Type } from "@google/genai";

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

  const [showQR, setShowQR] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      // Auto-trigger smart fill for new SKUs
      handleSmartFill(initialSku);
    }
  }, [product, initialSku]);

  const handleSmartFill = async (skuToAnalyze: string) => {
    if (!skuToAnalyze || skuToAnalyze.length < 3 || product) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Identify the product associated with this Barcode/SKU/Serial ID: "${skuToAnalyze}". 
        Use Google Search to find the exact product name, its category, and its current market price in INR.
        If it's a standard retail barcode (like EAN or UPC), find the real product.
        Return the data in JSON format. The category MUST be one of: ${CATEGORIES.join(', ')}.
        If no exact match is found, suggest a plausible name based on the SKU pattern.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              price: { type: Type.NUMBER }
            },
            required: ["name", "category", "price"]
          }
        }
      });

      const suggestion = JSON.parse(response.text || '{}');
      if (suggestion.name) {
        setFormData(prev => ({
          ...prev,
          name: suggestion.name,
          category: CATEGORIES.includes(suggestion.category) ? suggestion.category : prev.category,
          price: suggestion.price || prev.price
        }));
      }
    } catch (err) {
      console.error("Smart Fill failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const downloadQR = () => {
    const svg = document.getElementById('product-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${formData.sku}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const inputStyle = "w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all font-bold text-sm shadow-inner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1e293b] w-full max-w-xl max-h-[90vh] flex flex-col rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {product ? 'Asset Modification' : 'New Asset Entry'}
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">
              {isAnalyzing ? 'AI is analyzing SKU...' : 'Update the master database'}
            </p>
          </div>
          <div className="flex gap-2">
            {product && (
              <button 
                onClick={() => setShowQR(!showQR)}
                className={`p-3 rounded-2xl transition-all ${showQR ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Toggle QR Label"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 7v10"/><path d="M7 12h10"/></svg>
              </button>
            )}
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showQR && product ? (
            <div className="p-10 flex flex-col items-center justify-center bg-slate-900/50 animate-in slide-in-from-top duration-300">
              <div className="bg-white p-6 rounded-3xl shadow-2xl mb-6">
                <QRCodeSVG 
                  id="product-qr"
                  value={product.sku} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-white font-black uppercase tracking-widest text-sm mb-2">{product.name}</p>
              <p className="text-slate-500 font-mono text-xs mb-8">SKU: {product.sku}</p>
              <button 
                onClick={downloadQR}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
              >
                Download Label (PNG)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="product-form" className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Asset Name</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputStyle + (isAnalyzing ? " animate-pulse border-indigo-500/50" : "")}
                      placeholder={isAnalyzing ? "AI is thinking..." : "PRO-GRADE PRODUCT NAME"}
                    />
                    {isAnalyzing && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
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
                    value={isNaN(formData.price) ? '' : formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Initial Reserve</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={isNaN(formData.stockLevel) ? '' : formData.stockLevel}
                    onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Low Stock Alert Level</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={isNaN(formData.lowStockThreshold) ? '' : formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    className={inputStyle}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {!showQR && (
          <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border border-white/5 text-slate-400 font-black uppercase tracking-widest hover:bg-white/5 transition-all text-sm"
            >
              Discard
            </button>
            <button
              type="submit"
              form="product-form"
              className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-500 transition-all text-sm shadow-xl shadow-indigo-600/20"
            >
              {product ? 'Commit Changes' : 'Register Asset'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
