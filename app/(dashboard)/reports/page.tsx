import { Download, FileText, Calendar, HardDrive, ShieldAlert, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SearchFilter from "@/components/ui/SearchFilter";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="text-center py-12">Anda harus login untuk melihat halaman ini.</div>;

  const { data: scans, error } = await supabase
    .from('scans').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const displayScans = scans || [];
  
  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const typeFilter = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const filteredScans = displayScans.filter(scan => {
    if (q && !scan.target_url?.toLowerCase().includes(q) && !scan.id.toLowerCase().includes(q)) return false;
    if (typeFilter !== 'all' && scan.target_type !== typeFilter) return false;
    
    let status = 'Aman';
    if (scan.risk_score > 70) status = 'Berbahaya';
    else if (scan.risk_score > 30) status = 'Mencurigakan';
    
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Laporan PDF</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Unduh laporan forensik dari riwayat pemindaian Anda.</p>
        </div>
      </div>

      <SearchFilter />

      {error ? (
        <div className="text-red-500 text-center py-8 text-sm">Gagal memuat data laporan.</div>
      ) : filteredScans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-10 sm:p-16 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-2">Tidak Ada Hasil</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-6">Tidak ditemukan laporan yang cocok dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScans.map((scan: any) => {
            const isDanger = scan.risk_score > 70;
            const isSuspicious = scan.risk_score > 30 && scan.risk_score <= 70;
            const isSafe = scan.risk_score <= 30;
            const dateStr = new Date(scan.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <div key={scan.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : isSuspicious ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                    {isDanger || isSuspicious ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isDanger ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : isSuspicious ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'}`}>
                    SKOR: {scan.risk_score}
                  </div>
                </div>
                
                <div className="mb-4 flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 truncate">
                    Laporan-{scan.id.split('-')[0].toUpperCase()}
                  </h3>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center gap-1.5 truncate" title={scan.target_url}>
                      <HardDrive className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="truncate">{scan.target_url}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                      {dateStr}
                    </p>
                  </div>
                </div>
                
                <Link 
                  href={`/scan/${scan.id}`} 
                  className="mt-auto w-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:bg-slate-800 flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
