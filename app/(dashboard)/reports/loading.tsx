
export default function ReportsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-64"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm h-48 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-800"></div>
              <div className="w-16 h-5 rounded-md bg-gray-200 dark:bg-slate-800"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
            <div className="w-full h-10 mt-4 rounded-xl bg-gray-200 dark:bg-slate-800"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
