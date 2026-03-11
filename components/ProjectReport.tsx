import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Icons } from '../constants.tsx';

interface ProjectReportProps {
  onClose: () => void;
}

const ProjectReport: React.FC<ProjectReportProps> = ({ onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      // Temporarily expand the container to capture everything
      const originalHeight = reportRef.current.style.height;
      const originalOverflow = reportRef.current.style.overflow;
      reportRef.current.style.height = 'auto';
      reportRef.current.style.overflow = 'visible';

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        windowHeight: reportRef.current.scrollHeight
      });
      
      // Restore original styles
      reportRef.current.style.height = originalHeight;
      reportRef.current.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const totalImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = totalImgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - totalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('DJ-STOCK-Comprehensive-Report.pdf');
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Comprehensive Documentation</h3>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">Technical Whitepaper & Architecture Guide</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Pages...</>
              ) : (
                <><Icons.Plus /> Download Multi-Page PDF</>
              )}
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#0f172a]" ref={reportRef}>
          <div className="space-y-20 text-slate-300 max-w-4xl mx-auto pb-20">
            {/* Cover Page */}
            <section className="text-center space-y-8 py-20 border-b border-white/10">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-500/40 transform rotate-6 mb-8">
                DJ
              </div>
              <h1 className="text-7xl font-black text-white tracking-tighter uppercase">DJ STOCK<span className="text-indigo-500">.</span></h1>
              <h2 className="text-2xl text-indigo-400 font-bold tracking-widest uppercase">Technical Whitepaper & System Architecture</h2>
              <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto italic pt-6">
                "A Premium AI-Powered Inventory Management Ecosystem Built for Precision, Speed, and Scalability."
              </p>
              <div className="pt-20 text-sm font-mono text-slate-500">
                <p>Version: 2.0.0-Enterprise</p>
                <p>Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </section>

            {/* 1. Executive Summary */}
            <section className="space-y-6">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">01. Executive Summary</h2>
              <p className="text-lg leading-relaxed text-slate-300">
                DJ STOCK is a next-generation inventory management system designed to bridge the gap between physical assets and digital intelligence. 
                Traditional inventory systems rely heavily on manual data entry, which is prone to human error and highly time-consuming. 
                DJ STOCK disrupts this workflow by introducing a dual-layered Artificial Intelligence approach.
              </p>
              <p className="text-lg leading-relaxed text-slate-300">
                By combining real-time optical barcode scanning with Google's Gemini 3.0 Flash AI, the system automates product identification, 
                categorization, pricing estimation, and depletion monitoring. The result is a frictionless stock-taking experience that requires 
                near-zero manual typing.
              </p>
            </section>

            {/* 2. System Architecture */}
            <section className="space-y-8">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">02. System Architecture</h2>
              <p className="text-slate-300 leading-relaxed">The application is built on a modern, serverless-ready frontend architecture, utilizing the latest web standards for maximum performance and cross-device compatibility.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                    <Icons.Chart />
                  </div>
                  <h3 className="text-white font-black text-lg uppercase tracking-widest">Frontend Framework</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Built on <strong>React 18</strong> with <strong>TypeScript</strong>. The architecture strictly follows functional component paradigms with React Hooks (useState, useEffect, useRef) managing the reactive data flow. Vite is used as the build tool for lightning-fast HMR and optimized production bundles.
                  </p>
                </div>
                
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                    <Icons.Scan />
                  </div>
                  <h3 className="text-white font-black text-lg uppercase tracking-widest">AI Intelligence Layer</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Powered by the <strong>@google/genai SDK</strong> utilizing the <strong>Gemini 3.0 Flash</strong> model. The AI layer handles two primary functions: Multimodal Vision (reading damaged/complex barcodes from images) and Semantic Search Grounding (fetching real-world product data based on SKU).
                  </p>
                </div>

                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                    <Icons.Alert />
                  </div>
                  <h3 className="text-white font-black text-lg uppercase tracking-widest">Optical Scanning Engine</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Integrates <strong>html5-qrcode</strong> for robust, client-side barcode decoding. It supports a wide array of formats including EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39, and standard QR codes. It interfaces directly with the device's WebRTC camera APIs.
                  </p>
                </div>

                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4">
                    <Icons.History />
                  </div>
                  <h3 className="text-white font-black text-lg uppercase tracking-widest">State & Persistence</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Currently utilizes synchronous <strong>localStorage</strong> for zero-latency state persistence, making it a fully functional Progressive Web App (PWA) capable of offline operation. The state tree maintains Products, Transactions, and Settings.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Deep Dive: AI Integration */}
            <section className="space-y-8">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">03. Deep Dive: AI Integration</h2>
              
              <div className="space-y-8">
                <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">A. The "Smart Fill" Algorithm</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    When a user scans a barcode that does not exist in the local database, the system intercepts the SKU and triggers the Smart Fill algorithm. 
                    It constructs a highly specific prompt instructing Gemini to act as an inventory data specialist.
                  </p>
                  <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                    {`await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "Identify the product with barcode/SKU: \${sku}. Return a JSON object...",
  config: { responseMimeType: "application/json" }
});`}
                  </div>
                  <p className="text-slate-400 leading-relaxed mt-4">
                    The model returns a structured JSON response containing the product's standardized name, predicted category, and estimated market price in INR, which instantly populates the UI forms.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">B. The "AI Vision" Fallback</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Standard optical scanners fail on blurry, high-resolution, or damaged barcodes. DJ STOCK implements a fallback mechanism. If the `html5-qrcode` library throws an exception during file upload, the image is converted to Base64 and sent to Gemini's multimodal endpoint.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Gemini analyzes the pixels, identifies the barcode structure visually, and extracts the numeric sequence, effectively bypassing traditional algorithmic scanning limitations.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data Models */}
            <section className="space-y-8">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">04. Core Data Models</h2>
              <p className="text-slate-300 mb-6">The application relies on strictly typed TypeScript interfaces to ensure data integrity across the ecosystem.</p>
              
              <div className="space-y-6">
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700">
                  <h4 className="text-white font-bold mb-4">Product Interface</h4>
                  <pre className="text-xs text-indigo-300 font-mono overflow-x-auto">
{`interface Product {
  id: string;               // Unique UUID
  sku: string;              // Barcode or Serial Number
  name: string;             // Human-readable asset name
  category: Category;       // Enum: Electronics, Consumables, etc.
  price: number;            // Asset value in INR
  stockLevel: number;       // Current physical count
  lowStockThreshold: number;// Depletion alert trigger level
  lastUpdated: number;      // Unix timestamp
}`}
                  </pre>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700">
                  <h4 className="text-white font-bold mb-4">Transaction Interface</h4>
                  <pre className="text-xs text-emerald-300 font-mono overflow-x-auto">
{`interface Transaction {
  id: string;               // Unique UUID
  productId: string;        // Reference to Product.id
  productName: string;      // Denormalized for historical accuracy
  type: 'IN' | 'OUT';       // Addition or Depletion
  quantity: number;         // Amount changed
  timestamp: number;        // Unix timestamp
  note?: string;            // Optional auditor notes
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 5. Deployment Guide */}
            <section className="space-y-8">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">05. Production Deployment (Render.com)</h2>
              <p className="text-slate-300 leading-relaxed">
                DJ STOCK is built with Vite and React, making it a Static Single Page Application (SPA). It can be deployed easily to modern cloud providers like Render.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Prepare the Repository</h4>
                    <p className="text-slate-400 text-sm mt-1">Push your source code to a GitHub, GitLab, or Bitbucket repository.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Create a Static Site on Render</h4>
                    <p className="text-slate-400 text-sm mt-1">Log into Render.com, click "New +" and select "Static Site". Connect your Git repository.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Configure Build Settings</h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm mt-2 space-y-1 ml-2">
                      <li><strong>Build Command:</strong> <code className="bg-black/50 px-2 py-1 rounded text-emerald-400">npm install && npm run build</code></li>
                      <li><strong>Publish Directory:</strong> <code className="bg-black/50 px-2 py-1 rounded text-emerald-400">dist</code></li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">4</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Environment Variables</h4>
                    <p className="text-slate-400 text-sm mt-1">In the Render dashboard, go to the "Environment" tab and add your Gemini API Key:</p>
                    <code className="block bg-black/50 px-4 py-2 rounded text-emerald-400 mt-2 text-sm">GEMINI_API_KEY = your_api_key_here</code>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">5</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Configure SPA Routing (Crucial)</h4>
                    <p className="text-slate-400 text-sm mt-1">To ensure direct links work without 404 errors, go to "Redirects/Rewrites" in Render and add a rule:</p>
                    <ul className="list-disc list-inside text-slate-400 text-sm mt-2 space-y-1 ml-2">
                      <li><strong>Source:</strong> <code className="bg-black/50 px-2 py-1 rounded text-emerald-400">/*</code></li>
                      <li><strong>Destination:</strong> <code className="bg-black/50 px-2 py-1 rounded text-emerald-400">/index.html</code></li>
                      <li><strong>Action:</strong> Rewrite</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Future Roadmap */}
            <section className="space-y-6">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">06. Future Roadmap</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-2">Cloud Sync (Firebase)</h4>
                  <p className="text-xs text-slate-400">Migrating from LocalStorage to Firestore for real-time multi-user collaboration and cross-device syncing.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-2">Export Engine</h4>
                  <p className="text-xs text-slate-400">Adding CSV and Excel export capabilities for accounting and auditing purposes.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-2">Predictive Analytics</h4>
                  <p className="text-xs text-slate-400">Using AI to predict when stock will run out based on historical transaction velocity.</p>
                </div>
              </div>
            </section>

             {/* Footer */}
             <section className="text-center pt-20 pb-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 border-t border-white/10 mt-20">
              Generated by DJ STOCK System Intelligence • Confidential & Proprietary
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectReport;
