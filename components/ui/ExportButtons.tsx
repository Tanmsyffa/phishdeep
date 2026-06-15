'use client';

import { Download } from 'lucide-react';

export default function ExportButtons({ data }: { data: any }) {

  const handleExportCSV = () => {
    // Simple CSV conversion for the details array
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

  return (
    <div className="flex gap-2">

      <button onClick={handleExportCSV} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 sm:px-4 sm:py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">CSV</span>
      </button>
    </div>
  );
}
