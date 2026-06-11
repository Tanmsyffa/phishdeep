import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Eye, ClipboardList } from "lucide-react";
import DeleteScanButton from "@/components/ui/DeleteScanButton";
import SearchFilter from "@/components/ui/SearchFilter";

function getStatusColor(score: number) {
  if (score > 70) return { label: 'Berbahaya', color: 'bg-red-50 text-red-600 border-red-100' };
  if (score > 30) return { label: 'Mencurigakan', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
  return { label: 'Aman', color: 'bg-green-50 text-green-600 border-green-100' };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let scans: any[] = [];
  if (user) {
    try {
      const { data, error } = await supabase
        .from('scans').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) scans = data;
    } catch (err) {
      console.error("Scans table error:", err);
    }
  }

  const displayScans = scans.map((s: any) => {
    const status = getStatusColor(s.risk_score);
    return {
      id: s.id, jenis: s.target_type, target: s.target_url,
      hasil: status.label, warna: status.color,
      tanggal: new Date(s.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
  });

  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const typeFilter = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const filteredScans = displayScans.filter(row => {
    if (q && !row.target.toLowerCase().includes(q)) return false;
    if (typeFilter !== 'all' && row.jenis !== typeFilter) return false;
    if (statusFilter !== 'all' && row.hasil !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Riwayat Scan</h1>
          <p className="text-xs sm:text-sm text-gray-500">Daftar semua aktivitas pemindaian Anda.</p>
        </div>
      </div>

      <SearchFilter />

      {filteredScans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 sm:p-16 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Tidak Ada Hasil</h2>
          <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">Tidak ditemukan data scan yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 sm:hidden">
            {filteredScans.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-semibold text-gray-800 truncate flex-1 min-w-0">{row.target}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${row.warna}`}>
                    {row.hasil}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{row.jenis}</span>
                    <span>{row.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/scan/${row.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <DeleteScanButton id={row.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Target</th>
                    <th className="px-6 py-3">Jenis</th>
                    <th className="px-6 py-3">Hasil</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredScans.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 max-w-[300px] truncate text-gray-700 font-medium">{row.target}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium text-xs">{row.jenis}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${row.warna}`}>
                          {row.hasil}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{row.tanggal}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/scan/${row.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-xs" title="Lihat Detail">
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
        </>
      )}
    </div>
  );
}
