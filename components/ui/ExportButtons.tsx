'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';

export default function ExportButtons({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    setIsOpen(false);
    const details = data.results_json?.details || [];
    let csv = 'Step,Finding\r\n';
    details.forEach((d: any) => {
      const step = d.step.replace(/"/g, '""');
      const finding = d.finding.replace(/"/g, '""');
      csv += `"${step}","${finding}"\r\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishdeep_report_${data.id.split('-')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setIsOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto mt-2 sm:mt-0" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
      >
        <Download className="w-4 h-4" /> Download Laporan <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-50 overflow-hidden origin-top animate-in fade-in zoom-in-95">
          <button 
            onClick={handleExportPDF}
            className="w-full text-left px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-3 font-medium"
          >
            <FileText className="w-4 h-4 text-red-500 shrink-0" /> Format PDF
          </button>
          <div className="border-t border-gray-100 dark:border-slate-800"></div>
          <button 
            onClick={handleExportCSV}
            className="w-full text-left px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-3 font-medium"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" /> Format CSV
          </button>
        </div>
      )}
    </div>
  );
}
