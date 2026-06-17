import { Loader2 } from "lucide-react";

export default function HistoryLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-64"></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm font-medium">Memuat riwayat scan...</p>
        </div>
      </div>
    </div>
  );
}
