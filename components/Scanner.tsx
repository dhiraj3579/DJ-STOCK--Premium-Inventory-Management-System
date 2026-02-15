
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants.tsx';

interface ScannerProps {
  onScan: (sku: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [sku, setSku] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to access camera for effect
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sku.trim()) {
      onScan(sku.trim());
      setSku('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Icons.Scan /> Barcode Scanner
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
          />
          <div className="z-10 w-64 h-32 border-2 border-emerald-500 rounded-lg relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800">
          <p className="text-slate-400 text-xs text-center mb-4">
            Point your camera at a barcode or enter SKU manually below
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter SKU..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Scan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
