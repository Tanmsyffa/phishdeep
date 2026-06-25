import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white\/5 shrink-0"></div>
        <div className="space-y-2">
          <div className="h-7 bg-gray-200 dark:bg-white\/5 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-white\/5 rounded w-64"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white\/10 p-5 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white\/5"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-white\/5 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-white\/5 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white\/10 p-5 h-80 flex items-center justify-center shadow-sm">
           <div className="flex flex-col items-center gap-3 text-gray-400">
             <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
             <p className="text-sm font-medium">Memuat statistik...</p>
           </div>
        </div>
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white\/10 p-5 h-80 shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-white\/5 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-white\/5 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-white\/5 rounded w-24"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-white\/5 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
