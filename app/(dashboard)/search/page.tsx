"use client";

import { useState } from "react";
import { Search, ShieldAlert, AlertCircle, CheckCircle, ExternalLink, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);

    // Cek apakah format UUID valid
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(q)) {
      setSearchError("Format ID tidak valid. Pastikan ID berupa format UUID lengkap (misal: 123e4567-e89b-12d3-a456-426614174000).");
      setIsSearching(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_scan_by_id', { scan_id: q });

    if (error || !data || data.length === 0) {
      setSearchError("Scan dengan ID tersebut tidak ditemukan, atau data scan telah kedaluwarsa/dihapus.");
    } else {
      setSearchResult(data[0]);
    }
    setIsSearching(false);
  };

  const handleViewDetail = (scanId: string) => {
    router.push(`/scan/${scanId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Cari ID Scan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cari dan lihat detail riwayat scan milik orang lain atau publik menggunakan ID Scan mereka.</p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Masukkan UUID Scan (contoh: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-sm"
          >
            {isSearching ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Cari Scan</span>
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <strong>Tip:</strong> Anda dapat menemukan ID Scan pada halaman "Statistik Komunitas" di Dashboard Anda, atau dari link yang dibagikan pengguna lain.
        </p>
      </div>

      {/* Search Result */}
      {searchError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{searchError}</p>
        </div>
      )}

      {searchResult && (() => {
        const isDanger = searchResult.risk_score > 70;
        const isSusp = searchResult.risk_score > 30 && searchResult.risk_score <= 70;
        const isSafe = searchResult.risk_score <= 30;

        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Hasil Pencarian
              </h2>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-100 dark:border-slate-700">
                {searchResult.id}
              </span>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {isDanger ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-800 text-[10px] uppercase tracking-wider">
                        <ShieldAlert className="w-3 h-3" /> Berbahaya
                      </span>
                    ) : isSusp ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 font-semibold border border-yellow-100 dark:border-yellow-800 text-[10px] uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Mencurigakan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold border border-green-100 dark:border-green-800 text-[10px] uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Aman
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">
                      Skor: {searchResult.risk_score}/100
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate mb-1" title={searchResult.target_url}>
                    {searchResult.target_url}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <p>Oleh: <span className="font-semibold text-gray-700 dark:text-gray-300">{searchResult.user_name || 'Seorang pengguna'}</span></p>
                    <span>•</span>
                    <p>Waktu: {new Date(searchResult.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleViewDetail(searchResult.id)}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Lihat Detail Laporan <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
