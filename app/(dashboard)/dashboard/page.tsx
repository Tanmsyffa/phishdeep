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
  let allScansForTrend: any[] = [];
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

    // Untuk grafik 7 hari, kita fetch data sejak 7 hari lalu
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    try {
      // DONT delete old scans so history is preserved
      const { data, error } = await supabase
        .from('scans').select('*').eq('user_id', user.id)
        .gte('created_at', sevenDaysAgoISO).order('created_at', { ascending: false });
      if (!error && data) {
        allScansForTrend = data;
        // Scans untuk perhitungan hari ini
        scans = data.filter(s => new Date(s.created_at) >= new Date(todayISO));
      }
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

  // Calculate 7-day trend data
  const trendData = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    
    // Filter out deleted items from trend stats
    const validScans = allScansForTrend.filter(s => s.status !== 'deleted');
    const dayScans = validScans.filter(s => s.created_at.startsWith(dateStr));
    const total = dayScans.length;
    const bahaya = dayScans.filter(s => s.risk_score > 70).length;
    trendData.push({ dayName, dateStr, total, bahaya });
  }

  const categories = [
    { type: 'Link', title: 'Statistik Link', icon: <LinkIcon className="w-4 h-4 text-blue-600"/>, bg: 'bg-blue-50' },
    { type: 'APK', title: 'Statistik APK', icon: <Smartphone className="w-4 h-4 text-green-600"/>, bg: 'bg-green-50' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Ringkasan aktivitas scanning Anda hari ini</p>
        </div>
      </div>

      {/* Stats Cards grouped by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c) => {
          const catScans = scans.filter(s => s.target_type === c.type);
          const dang = catScans.filter(s => s.risk_score > 70).length;
          const susp = catScans.filter(s => s.risk_score > 30 && s.risk_score <= 70).length;
          const safe = catScans.filter(s => s.risk_score <= 30).length;

          return (
            <div key={c.type} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{c.title}</h3>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white leading-none mb-0.5">{catScans.length}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold block">Total</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0"/> Berbahaya</span>
                  <span className="font-bold text-gray-900 dark:text-white">{dang}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><AlertCircle className="w-4 h-4 text-yellow-500 shrink-0"/> Mencurigakan</span>
                  <span className="font-bold text-gray-900 dark:text-white">{susp}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Aman</span>
                  <span className="font-bold text-gray-900 dark:text-white">{safe}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Trend Chart (7 Hari Terakhir) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-1">Tren Analisis (7 Hari)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">Perbandingan total scan vs ancaman berbahaya harian.</p>
          
          {(() => {
            const CHART_H = 120; // fixed pixel height for the bar area
            const maxVal = Math.max(...trendData.map(t => t.total), 1);
            return (
              <>
                {/* Chart wrapper: Y-axis + bars */}
                <div className="flex gap-2">
                  {/* Y-axis */}
                  <div className="w-6 shrink-0 flex flex-col justify-between items-end text-[9px] text-gray-400 dark:text-gray-500 font-medium" style={{ height: `${CHART_H}px` }}>
                    <span>{maxVal}</span>
                    <span>{Math.round(maxVal / 2)}</span>
                    <span>0</span>
                  </div>
                  
                  {/* Bars area */}
                  <div className="flex-1 relative border-l border-b border-gray-100 dark:border-slate-700" style={{ height: `${CHART_H}px` }}>
                    {/* Horizontal dashed grid lines */}
                    <div className="absolute left-0 right-0 border-t border-dashed border-gray-100 dark:border-slate-700" style={{ top: '0%' }} />
                    <div className="absolute left-0 right-0 border-t border-dashed border-gray-100 dark:border-slate-700" style={{ top: '50%' }} />

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-around px-1 pb-0">
                      {trendData.map((t, idx) => {
                        const barH = maxVal > 0 ? Math.max(Math.round((t.total / maxVal) * CHART_H), t.total > 0 ? 4 : 0) : 0;
                        const dangH = t.total > 0 && t.bahaya > 0 ? Math.round((t.bahaya / t.total) * barH) : 0;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-end group"
                            style={{ height: `${CHART_H}px`, minWidth: '12px', flex: 1 }}
                          >
                            <div className="w-full flex justify-center">
                              {barH > 0 ? (
                                <div
                                  className="w-4 sm:w-5 lg:w-6 rounded-t-sm relative overflow-hidden bg-blue-200 group-hover:bg-blue-300 transition-colors cursor-default"
                                  style={{ height: `${barH}px` }}
                                >
                                  {dangH > 0 && (
                                    <div
                                      className="absolute bottom-0 left-0 right-0 bg-red-400"
                                      style={{ height: `${dangH}px` }}
                                    />
                                  )}
                                  {/* Tooltip */}
                                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap transition-opacity shadow-lg z-20">
                                    {t.total}S / {t.bahaya}B
                                  </div>
                                </div>
                              ) : (
                                <div className="w-4 sm:w-5 lg:w-6 h-0.5 bg-gray-100 dark:bg-slate-800 rounded-sm" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Day labels */}
                <div className="flex justify-around pl-8 mt-1.5">
                  {trendData.map((t, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">{t.dayName}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-3 text-[10px] font-medium justify-center border-t border-gray-100 dark:border-slate-700 pt-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-200 rounded-sm inline-block"></span> Total Scan</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm inline-block"></span> Bahaya Terdeteksi</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Distribution & Limit */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Batas Scan Harian</h3>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Terpakai</span>
              <span className="font-bold text-gray-900 dark:text-white">{todayScanCount} / 10</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${todayScanCount >= 10 ? 'bg-red-500' : todayScanCount >= 7 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min((todayScanCount / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Reset setiap tengah malam (00:00 WIB).</p>
            {todayScanCount >= 10 && (
              <div className="mt-3 text-xs bg-red-50 text-red-600 rounded-lg p-2.5 border border-red-100">
                Batas harian tercapai. Kembali lagi besok!
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Sebaran Target (7 Hari)</h3>
            {(() => {
              const linkCount = allScansForTrend.filter(s => s.target_type === 'Link').length;
              const apkCount  = allScansForTrend.filter(s => s.target_type === 'APK').length;
              const total = linkCount + apkCount;
              // Proportional percentages — always sum to 100
              const lPct = total > 0 ? (linkCount / total) * 100 : 0;
              const aPct = total > 0 ? (apkCount / total) * 100 : 0;
              return (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-gray-100 dark:bg-slate-800">
                    {lPct > 0 && <div style={{ width: `${lPct}%` }} className="bg-blue-500 transition-all" />}
                    {aPct > 0 && <div style={{ width: `${aPct}%` }} className="bg-green-500 transition-all" />}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Link</span>
                      <span className="font-bold text-gray-700">{linkCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> APK</span>
                      <span className="font-bold text-gray-700">{apkCount}</span>
                    </div>
                    {total === 0 && (
                      <p className="text-gray-400 dark:text-gray-500 text-center pt-1 text-[10px]">Belum ada data scan dalam 7 hari terakhir.</p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Grid for History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activity Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Aktivitas Terakhir</h2>
            <Link href="/history" className="text-xs text-blue-600 font-medium hover:text-blue-700">Lihat semua →</Link>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-50">
            {displayScans.length === 0 ? (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">Belum ada aktivitas scan</p>
            ) : displayScans.map(row => (
              <Link key={row.id} href={`/scan/${row.id}`} className="block px-4 py-3 hover:bg-gray-50 dark:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{row.target}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${row.warna}`}>{row.hasil}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 px-1.5 py-0.5 rounded font-medium">{row.jenis}</span>
                  <span>{row.tanggal}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs font-medium border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Jenis</th>
                  <th className="px-6 py-3">Hasil</th>
                  <th className="px-6 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayScans.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">Belum ada aktivitas scan</td></tr>
                ) : displayScans.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:bg-slate-800/70 transition-colors">
                    <td className="px-6 py-3.5 max-w-[220px] truncate text-gray-700 font-medium">
                      <Link href={`/scan/${row.id}`} className="hover:text-blue-600 transition-colors">{row.target}</Link>
                    </td>
                    <td className="px-6 py-3.5"><span className="bg-gray-100 dark:bg-slate-800 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{row.jenis}</span></td>
                    <td className="px-6 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${row.warna}`}>{row.hasil}</span></td>
                    <td className="px-6 py-3.5 text-gray-400 dark:text-gray-500 text-xs">{row.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl text-white">
            <h3 className="font-bold mb-1 text-sm">Mulai Scan Baru</h3>
            <p className="text-xs text-blue-200 mb-4 leading-relaxed">Analisis link atau APK mencurigakan sekarang.</p>
            <Link href="/scan" className="block text-center bg-white dark:bg-slate-900 text-blue-700 font-bold py-2 px-4 rounded-xl text-sm hover:bg-blue-50 transition-colors">
              Scan Sekarang →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
