
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Icons } from '../constants.tsx';
import { GoogleGenAI } from "@google/genai";

interface ScannerProps {
  onScan: (sku: string, mode: 'IN' | 'OUT', continuous: boolean) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [sku, setSku] = useState('');
  const [mode, setMode] = useState<'IN' | 'OUT'>('IN');
  const [continuous, setContinuous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const continuousRef = useRef(continuous);
  const [scannerId] = useState(() => `scanner-${Math.random().toString(36).substr(2, 9)}`);
  const [fileScannerId] = useState(() => `file-scanner-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Try to find a back camera
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          setCurrentCameraId(backCamera ? backCamera.id : devices[0].id);
        }
      } catch (err) {
        console.error("Error getting cameras", err);
      }
    };
    getCameras();
  }, []);

  useEffect(() => {
    if (!currentCameraId) return;

    let isMounted = true;
    const startScanner = async () => {
      try {
        setIsInitializing(true);
        if (scannerRef.current) {
          await stopScanner();
        }
        
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 25,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = viewfinderWidth * 0.85;
            const height = viewfinderHeight * 0.45;
            return { width: Math.max(width, 260), height: Math.max(height, 160) };
          },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
          ]
        };

        await html5QrCode.start(
          currentCameraId,
          config,
          async (decodedText) => {
            if (!isMounted) return;
            try {
              if (!continuousRef.current) {
                await stopScanner();
              }
              if (isMounted) onScan(decodedText, modeRef.current, continuousRef.current);
            } catch (err) {
              if (isMounted) onScan(decodedText, modeRef.current, continuousRef.current);
            }
          },
          () => {}
        );

        if (isMounted) setIsInitializing(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Scanner initialization failed", err);
        setError("Could not access camera. Please try another camera or ensure permissions are granted.");
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      // We don't await here, but we trigger the stop
      stopScanner();
    };
  }, [currentCameraId]);

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCameraId(cameras[nextIndex].id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = error => reject(error);
      });
    };

    try {
      setIsInitializing(true);
      setError(null);
      
      // Use a dedicated instance for file scanning to avoid camera conflicts
      const html5QrCode = new Html5Qrcode(fileScannerId);
      
      try {
        const decodedText = await html5QrCode.scanFile(file, false);
        onScan(decodedText, modeRef.current, false);
        setIsInitializing(false);
        try { html5QrCode.clear(); } catch (e) {}
        return;
      } catch (libErr) {
        console.warn("Library scan failed, attempting AI Vision fallback...", libErr);
        
        // AI Fallback
        const base64Data = await fileToBase64(file);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type
              }
            },
            {
              text: "Read the barcode or QR code in this image. Return ONLY the numeric or alphanumeric value of the code. If you see multiple, return the most prominent one. If no code is found, return 'NONE'."
            }
          ]
        });

        const aiCode = response.text?.trim();
        if (aiCode && aiCode !== 'NONE' && aiCode.length > 2) {
          onScan(aiCode, modeRef.current, false);
          setIsInitializing(false);
          return;
        }
        throw new Error("AI could not detect code");
      }
    } catch (err) {
      console.error("Scanning failed", err);
      setError("The scanner couldn't read this image. This can happen with some high-resolution barcodes. Please try taking a closer photo or use the manual entry below.");
      setIsInitializing(false);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
 // Restart scanner if mode changes to ensure callback has fresh mode

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        // Use a Promise.race to prevent hanging indefinitely
        await Promise.race([
          scannerRef.current.stop(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Stop timeout")), 1500))
        ]);
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner gracefully", err);
        // Even if it fails, we should try to clear
        try { scannerRef.current.clear(); } catch (e) {}
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sku.trim()) {
      await stopScanner();
      onScan(sku.trim(), mode, false);
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Upload Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-2 bg-slate-800 border-b border-white/5">
          <div className="flex flex-1 bg-slate-900 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setMode('IN')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'IN' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Stock In (+)
            </button>
            <button 
              onClick={() => setMode('OUT')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'OUT' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Stock Out (-)
            </button>
          </div>
          
          <button
            onClick={() => setContinuous(!continuous)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${continuous ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`w-2 h-2 rounded-full ${continuous ? 'bg-white animate-pulse' : 'bg-slate-700'}`}></div>
            Continuous
          </button>
        </div>
        
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <div id={scannerId} className="w-full h-full"></div>
          <div id={fileScannerId} className="hidden"></div>
          
          {/* Overlay UI */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
            {isInitializing && !error && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Starting Camera...</p>
              </div>
            )}
            
            {!isInitializing && !error && (
              <div className={`w-[80%] h-[40%] border-2 ${mode === 'IN' ? 'border-emerald-500' : 'border-red-500'} rounded-lg relative transition-colors`}>
                <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 ${mode === 'IN' ? 'border-emerald-500' : 'border-red-500'} -mt-1 -ml-1`}></div>
                <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 ${mode === 'IN' ? 'border-emerald-500' : 'border-red-500'} -mt-1 -mr-1`}></div>
                <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 ${mode === 'IN' ? 'border-emerald-500' : 'border-red-500'} -mb-1 -ml-1`}></div>
                <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 ${mode === 'IN' ? 'border-emerald-500' : 'border-red-500'} -mb-1 -mr-1`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-3 max-w-[85%] animate-in fade-in zoom-in duration-300">
                <Icons.Alert />
                <p className="text-red-400 text-xs text-center font-medium leading-relaxed">
                  {error}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Try Manual
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Overlay */}
          {!isInitializing && !error && (
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-4 px-4 pointer-events-auto">
              {cameras.length > 1 && (
                <button 
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19 2 10l9-9"/><path d="M22 21v-6a2 2 0 0 0-2-2H2"/><path d="m13 15 9 6"/></svg>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-800">
          <div className="flex flex-col gap-4">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">
              Manual Entry Fallback
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Type SKU or Serial ID..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold shadow-inner"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!sku.trim()}
                className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 ${mode === 'IN' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}
              >
                {mode === 'IN' ? 'Add' : 'Remove'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-40px); opacity: 0.2; }
          50% { transform: translateY(40px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
