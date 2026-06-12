import Link from "next/link";
import { ShieldAlert, AlertCircle, LayoutDashboard, CheckCircle, Link as LinkIcon, Smartphone, FileSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function getStatusColor(score: number) {
  if (score > 70) return { label: 'Berbahaya', color: 'bg-red-50 text-red-600 border-red-100' };
  if (score > 30) return { label: 'Mencurigakan', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
  return { label: 'Aman', color: 'bg-green-50 text-green-600 border-green-100' };
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let scans: any[] = [];
  if (user) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const todayISO = `${year}-${month}-${day}T00:00:00.000+07:00`;

    try {
      await supabase.from('scans').delete().eq('user_id', user.id).lt('created_at', todayISO);
      const { data, error } = await supabase
        .from('scans').select('*').eq('user_id', user.id)
        .gte('created_at', todayISO).order('created_at', { ascending: false });
      if (!error && data && data.length > 0) scans = data;
    } catch (err) {
      console.error("Scans table not ready or error:", err);
    }
  }

  const todayScanCount = scans.length;
  // Filter for display only (exclude deleted)
  const activeScans = scans.filter(s => s.status !== 'deleted');
  const displayScans = activeScans.slice(0, 5).map(s => {
    const status = getStatusColor(s.risk_score);
    return {
      id: s.id, jenis: s.target_type, target: s.target_url,
      hasil: status.label, warna: status.color,
      tanggal: new Date(s.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
  });

  const categories = [
    { type: 'Link', title: 'Statistik Link', icon: <LinkIcon className="w-4 h-4 text-blue-600"/>, bg: 'bg-blue-50' },
    { type: 'APK', title: 'Statistik APK', icon: <Smartphone className="w-4 h-4 text-purple-600"/>, bg: 'bg-purple-50' },
    { type: 'Dokumen', title: 'Statistik Dokumen', icon: <FileSearch className="w-4 h-4 text-orange-600"/>, bg: 'bg-orange-50' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500">Ringkasan aktivitas scanning Anda hari ini</p>
        </div>
      </div>

      {/* Stats Cards grouped by Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((c) => {
          const catScans = scans.filter(s => s.target_type === c.type);
          const dang = catScans.filter(s => s.risk_score > 70).length;
          const susp = catScans.filter(s => s.risk_score > 30 && s.risk_score <= 70).length;
          const safe = catScans.filter(s => s.risk_score <= 30).length;

          return (
            <div key={c.type} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{c.title}</h3>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-gray-900 leading-none mb-0.5">{catScans.length}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Total</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0"/> Berbahaya</span>
                  <span className="font-bold text-gray-900">{dang}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><AlertCircle className="w-4 h-4 text-yellow-500 shrink-0"/> Mencurigakan</span>
                  <span className="font-bold text-gray-900">{susp}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Aman</span>
                  <span className="font-bold text-gray-900">{safe}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Aktivitas Terakhir</h2>
            <Link href="/history" className="text-xs text-blue-600 font-medium hover:text-blue-700">Lihat semua →</Link>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-50">
            {displayScans.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">Belum ada aktivitas scan</p>
            ) : displayScans.map(row => (
              <Link key={row.id} href={`/scan/${row.id}`} className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate flex-1">{row.target}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${row.warna}`}>{row.hasil}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{row.jenis}</span>
                  <span>{row.tanggal}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Jenis</th>
                  <th className="px-6 py-3">Hasil</th>
                  <th className="px-6 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayScans.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada aktivitas scan</td></tr>
                ) : displayScans.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3.5 max-w-[220px] truncate text-gray-700 font-medium">
                      <Link href={`/scan/${row.id}`} className="hover:text-blue-600 transition-colors">{row.target}</Link>
                    </td>
                    <td className="px-6 py-3.5"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{row.jenis}</span></td>
                    <td className="px-6 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${row.warna}`}>{row.hasil}</span></td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs">{row.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Batas Scan Harian</h3>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500">Terpakai</span>
              <span className="font-bold text-gray-900">{todayScanCount} / 10</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${todayScanCount >= 10 ? 'bg-red-500' : todayScanCount >= 7 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min((todayScanCount / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">Reset setiap tengah malam (00:00 WIB).</p>
            {todayScanCount >= 10 && (
              <div className="mt-3 text-xs bg-red-50 text-red-600 rounded-lg p-2.5 border border-red-100">
                Batas harian tercapai. Kembali lagi besok!
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl text-white">
            <h3 className="font-bold mb-1 text-sm">Mulai Scan Baru</h3>
            <p className="text-xs text-blue-200 mb-4 leading-relaxed">Analisis link, APK, atau dokumen mencurigakan sekarang.</p>
            <Link href="/scan" className="block text-center bg-white text-blue-700 font-bold py-2 px-4 rounded-xl text-sm hover:bg-blue-50 transition-colors">
              Scan Sekarang →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
