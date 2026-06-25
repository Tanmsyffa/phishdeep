'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function ReScanButton({ targetUrl, targetType }: { targetUrl: string; targetType: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRescan = async () => {
    setLoading(true);
    // Navigate to scan page with pre-filled URL via query param
    router.push(`/scan?rescan=${encodeURIComponent(targetUrl)}&type=${encodeURIComponent(targetType)}`);
  };

  return (
    <button
      onClick={handleRescan}
      disabled={loading}
      title="Pindai ulang target yang sama dengan data terbaru"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white\/10 bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all text-sm font-semibold shadow-sm disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Re-Scan</span>
    </button>
  );
}
