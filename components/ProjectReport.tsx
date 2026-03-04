
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Icons } from '../constants.tsx';

interface ProjectReportProps {
  onClose: () => void;
}

const ProjectReport: React.FC<ProjectReportProps> = ({ onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DJ-STOCK-Project-Report.pdf');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Project Documentation</h3>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">Full Technical Report & Guidelines</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={downloadPDF}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2"
            >
              <Icons.Plus /> Download PDF
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar" ref={reportRef}>
          <div className="space-y-16 text-slate-300">
            {/* Header Section */}
            <section className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-500/40 transform rotate-6">
                DJ
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase">DJ STOCK<span className="text-indigo-500">.</span></h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto italic">"A Premium AI-Powered Inventory Management Ecosystem Built for Precision and Speed."</p>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {/* Overview */}
            <section className="space-y-6">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">01. Project Overview</h2>
              <p className="text-lg leading-relaxed">
                DJ STOCK is a next-generation inventory management system designed to bridge the gap between physical assets and digital intelligence. 
                By combining real-time barcode scanning with Google Gemini AI, the system automates the most tedious parts of stock management: 
                product identification, data entry, and depletion monitoring.
              </p>
            </section>

            {/* Tech Stack */}
            <section className="space-y-8">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">02. Technical Architecture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Frontend Framework</h3>
                  <p className="text-sm text-slate-400">React 18 with TypeScript for type-safe, component-based architecture. State is managed via React Hooks (useState/useRef) for real-time reactivity.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">AI Intelligence</h3>
                  <p className="text-sm text-slate-400">Google Gemini 3.0 Flash API with Search Grounding. Used for Smart Fill (product identification) and AI Vision (barcode extraction from images).</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Scanning Engine</h3>
                  <p className="text-sm text-slate-400">Html5-QRCode library for multi-format barcode detection (EAN-13, UPC, Code-128, QR) via camera and file upload.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Styling & UI</h3>
                  <p className="text-sm text-slate-400">Tailwind CSS for a premium "Dark Luxury" aesthetic. Motion animations for smooth transitions and Lucide-React for consistent iconography.</p>
                </div>
              </div>
            </section>

            {/* Core Features */}
            <section className="space-y-8">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">03. Core Features & Logic</h2>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    <Icons.Scan />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black text-lg">Smart Scan Ecosystem</h3>
                    <p className="text-slate-400">A dual-channel scanning system. Channel A uses the device camera for real-time detection. Channel B uses AI Vision to extract codes from uploaded photos when standard readers fail.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                    <Icons.Chart />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black text-lg">AI Smart Fill</h3>
                    <p className="text-slate-400">When a new barcode is detected, the system queries Gemini AI with Google Search grounding to automatically fetch the product name, category, and market price in INR.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
                    <Icons.Alert />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black text-lg">Depletion Logic</h3>
                    <p className="text-slate-400">Customizable "Low Stock Alert Levels" for every asset. The system monitors stock levels in real-time and triggers visual alerts when inventory hits critical thresholds.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Guidelines */}
            <section className="space-y-8 p-10 bg-indigo-600/10 rounded-[3rem] border border-indigo-500/20">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">04. Operational Guidelines</h2>
              <ul className="space-y-4 text-sm font-bold">
                <li className="flex gap-3 items-start">
                  <span className="text-indigo-500">→</span>
                  <span>Registration: Use "Register Asset" to add items. Let AI fill the details for speed.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-indigo-500">→</span>
                  <span>Scanning: Use "Smart Scan" for daily operations. Toggle "Continuous" for high-volume stock-taking.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-indigo-500">→</span>
                  <span>Labels: Generate QR labels from the product edit screen to tag items that don't have barcodes.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-indigo-500">→</span>
                  <span>Monitoring: Check the Insights Dashboard for real-time stock value and depletion trends.</span>
                </li>
              </ul>
            </section>

            {/* Footer */}
            <section className="text-center pt-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
              Generated by DJ STOCK System Intelligence • 2026
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectReport;
