import { Download, FileText, Calendar, HardDrive, ShieldAlert, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SearchFilter from "@/components/ui/SearchFilter";
import Pagination from "@/components/ui/Pagination";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="text-center py-12">Anda harus login untuk melihat halaman ini.</div>;

  let filteredScans: any[] = [];
  let error = null;
  let totalPages = 1;
  const currentPage = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) || 1 : 1;
  const limit = 10;
  const start = (currentPage - 1) * limit;
  const end = start + limit - 1;

  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const typeFilter = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  if (user) {
    try {
      let query = supabase
        .from('scans').select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .neq('status', 'deleted');

      if (q) query = query.ilike('target_url', `%${q}%`);
      if (typeFilter !== 'all') query = query.eq('target_type', typeFilter);
      if (statusFilter === 'Berbahaya') query = query.gt('risk_score', 70);
      if (statusFilter === 'Mencurigakan') query = query.gt('risk_score', 30).lte('risk_score', 70);
      if (statusFilter === 'Aman') query = query.lte('risk_score', 30);

      const res = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (res.data && !res.error) {
        filteredScans = res.data;
        if (res.count) totalPages = Math.ceil(res.count / limit);
      } else if (res.error) {
        error = res.error;
      }
    } catch (err) {
      console.error("Scans table error:", err);
      error = err;
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Laporan PDF</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unduh laporan forensik dari riwayat pemindaian Anda.</p>
        </div>
      </div>

      <SearchFilter />

      {error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400 max-w-xl mx-auto">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Gagal memuat data laporan.</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-3xl p-10 sm:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-2">Tidak Ada Hasil</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Tidak ditemukan laporan yang cocok dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScans.map((scan: any) => {
            const isDanger = scan.risk_score > 70;
            const isSuspicious = scan.risk_score > 30 && scan.risk_score <= 70;

            const dateStr = new Date(scan.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <div key={scan.id} className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-gray-200/50 dark:border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200 group">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : isSuspicious ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                    {isDanger || isSuspicious ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDanger ? 'bg-red-50 dark:bg-red-500/5 text-red-600 border-red-200 dark:border-red-500/20' : isSuspicious ? 'bg-yellow-50 dark:bg-yellow-500/5 text-yellow-600 border-yellow-200 dark:border-yellow-500/20' : 'bg-green-50 dark:bg-green-500/5 text-green-600 border-green-200 dark:border-green-500/20'}`}>
                    SKOR: {scan.risk_score}
                  </div>
                </div>
                
                <div className="mb-5 flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2.5 truncate">
                    Laporan-{scan.id.split('-')[0].toUpperCase()}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate" title={scan.target_url}>
                      <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate font-medium">{scan.target_url}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium">{dateStr}</span>
                    </p>
                  </div>
                </div>
                
                <Link 
                  href={`/scan/${scan.id}`} 
                  className="mt-auto w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-semibold py-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center gap-2 transition-all text-sm active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </Link>
              </div>
            );
          })}
        </div>
      )}
      
      {!error && filteredScans.length > 0 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
}
