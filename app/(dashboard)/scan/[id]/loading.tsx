import { Loader2 } from "lucide-react";

export default function ScanResultLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="w-32 h-6 bg-gray-200 dark:bg-slate-800 rounded"></div>
        <div className="w-48 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 h-48 shadow-sm">
             <div className="w-48 h-8 bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
             <div className="w-full h-16 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 h-[400px] shadow-sm flex items-center justify-center">
             <div className="flex flex-col items-center gap-3 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
               <p className="text-sm font-medium">Menganalisis hasil forensik...</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 h-64 shadow-sm">
            <div className="w-32 h-6 bg-gray-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="flex justify-between"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div></div>
              <div className="flex justify-between"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div></div>
              <div className="flex justify-between"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
