"use client";

import { useState } from "react";
import { Search, ShieldAlert, AlertCircle, CheckCircle, ExternalLink, Globe, Lightbulb } from "lucide-react";
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

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(q)) {
      setSearchError("Format ID tidak valid. Pastikan berupa UUID lengkap (misal: 123e4567-e89b-12d3-a456-426614174000).");
      setIsSearching(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_scan_by_id', { scan_id: q });
    if (error || !data || data.length === 0) {
      setSearchError("Scan tidak ditemukan, atau data telah kedaluwarsa/dihapus.");
    } else {
      setSearchResult(data[0]);
    }
    setIsSearching(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Cari ID Scan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lihat detail scan publik menggunakan ID Scan.</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Masukkan UUID Scan (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/8 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 active:scale-95 shadow-sm"
          >
            {isSearching
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Cari Scan</span>
          </button>
        </form>

        {/* Tip */}
        <div className="flex items-start gap-2.5 bg-blue-50/60 dark:bg-blue-500/8 border border-blue-100 dark:border-blue-500/15 rounded-2xl px-4 py-3">
          <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-semibold">Tip:</span> Temukan ID Scan di halaman <span className="font-semibold">Statistik Komunitas</span> pada Dashboard, atau dari link yang dibagikan pengguna lain.
          </p>
        </div>
      </div>

      {/* Error */}
      {searchError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm">{searchError}</p>
        </div>
      )}

      {/* Result */}
      {searchResult && (() => {
        const isDanger = searchResult.risk_score > 70;
        const isSusp = searchResult.risk_score > 30 && searchResult.risk_score <= 70;
        const statusLabel = isDanger ? 'Berbahaya' : isSusp ? 'Mencurigakan' : 'Aman';
        const statusClass = isDanger
          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
          : isSusp
          ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20'
          : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20';
        const StatusIcon = isDanger ? ShieldAlert : isSusp ? AlertCircle : CheckCircle;
        return (
          <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="px-6 py-4 border-b border-gray-100/80 dark:border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-500" /> Hasil Pencarian
              </h2>
              <code className="text-[10px] text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5 truncate max-w-[140px]">
                {searchResult.id}
              </code>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                    <StatusIcon className="w-3 h-3" /> {statusLabel}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-full border border-gray-100 dark:border-white/5">
                    Skor: {searchResult.risk_score}/100
                  </span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white truncate mb-1">{searchResult.target_url}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Oleh: <span className="font-semibold text-gray-700 dark:text-gray-300">{searchResult.user_name || 'Pengguna'}</span></span>
                  <span>•</span>
                  <span>{new Date(searchResult.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/scan/${searchResult.id}`)}
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
              >
                Lihat Detail <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
