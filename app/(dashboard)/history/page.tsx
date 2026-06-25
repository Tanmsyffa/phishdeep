import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Eye, ClipboardList } from "lucide-react";
import DeleteScanButton from "@/components/ui/DeleteScanButton";
import SearchFilter from "@/components/ui/SearchFilter";
import Pagination from "@/components/ui/Pagination";
import { redirect } from "next/navigation";

function getStatusColor(score: number) {
  if (score > 70) return { label: 'Berbahaya',    color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' };
  if (score > 30) return { label: 'Mencurigakan', color: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20' };
  return              { label: 'Aman',           color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20' };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let scans: any[] = [];
  let totalPages = 1;
  const currentPage = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) || 1 : 1;
  const limit = 10;
  const start = (currentPage - 1) * limit;
  const end = start + limit - 1;

  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const typeFilter = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  if (user) {
    try {
      let query = supabase
        .from('scans').select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', fortyEightHoursAgo)
        .neq('status', 'deleted');

      if (q) query = query.ilike('target_url', `%${q}%`);
      if (typeFilter !== 'all') query = query.eq('target_type', typeFilter);
      if (statusFilter === 'Berbahaya') query = query.gt('risk_score', 70);
      if (statusFilter === 'Mencurigakan') query = query.gt('risk_score', 30).lte('risk_score', 70);
      if (statusFilter === 'Aman') query = query.lte('risk_score', 30);

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (!error && data) {
        scans = data;
        if (count) totalPages = Math.ceil(count / limit);
        
        // Fix Pagination Bug: if page > 1 but no scans found, redirect to page 1
        if (scans.length === 0 && currentPage > 1) {
          redirect('/history');
        }
      }
    } catch (err) {
      console.error("Scans table error:", err);
    }
  }

  const filteredScans = scans.map((s: any) => {
    const status = getStatusColor(s.risk_score);
    return {
      id: s.id, jenis: s.target_type, target: s.target_url,
      hasil: status.label, warna: status.color,
      tanggal: new Date(s.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Riwayat Scan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daftar semua aktivitas pemindaian Anda.</p>
        </div>
      </div>

      <SearchFilter />

      {filteredScans.length === 0 ? (
        <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-3xl p-10 sm:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-7 h-7 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Tidak Ada Hasil</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-xs mx-auto">Tidak ditemukan data scan yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 sm:hidden">
            {filteredScans.map((row) => (
              <div key={row.id} className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/5 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate flex-1 min-w-0">{row.target}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${row.warna}`}>
                    {row.hasil}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md font-medium">{row.jenis}</span>
                    <span>{row.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/scan/${row.id}`} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <DeleteScanButton id={row.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/60 dark:bg-white/3 text-gray-500 dark:text-gray-400 text-xs font-semibold border-b border-gray-100/80 dark:border-white/5 tracking-wide">
                  <tr>
                    <th className="px-6 py-3.5">Target</th>
                    <th className="px-6 py-3.5">Jenis</th>
                    <th className="px-6 py-3.5">Hasil</th>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/60 dark:divide-white/5">
                  {filteredScans.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4 max-w-[300px] truncate text-gray-700 dark:text-gray-300 font-medium text-sm">{row.target}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100/80 dark:bg-white/8 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium text-xs border border-gray-200/50 dark:border-white/8">{row.jenis}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${row.warna}`}>{row.hasil}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs">{row.tanggal}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/scan/${row.id}`} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium">
                            <Eye className="w-4 h-4" /> Detail
                          </Link>
                          <DeleteScanButton id={row.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </>
      )}
    </div>
  );
}
