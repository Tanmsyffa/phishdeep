'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Target, X, Bell } from 'lucide-react';
import Link from 'next/link';

interface ScanNotification {
  id: string; // We'll generate a random ID for the toast since RPC doesn't return scan ID
  target_url: string;
  user_name: string;
  created_at: string;
  risk_score: number;
}

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<ScanNotification[]>([]);
  const supabase = createClient();
  // Gunakan ref untuk melacak timestamp terakhir yang dicek agar tidak ada closure issue di dalam setInterval
  const lastCheckedRef = useRef<Date>(new Date());

  useEffect(() => {
    // Fungsi untuk mengecek scan terbaru
    const checkNewScans = async () => {
      const { data, error } = await supabase.rpc('get_community_scans');
      if (error || !data || data.length === 0) return;

      // Cari scan yang lebih baru dari lastChecked
      const newScans = data.filter((scan: any) => new Date(scan.created_at) > lastCheckedRef.current);

      if (newScans.length > 0) {
        // Update last checked time ke waktu scan paling baru
        const maxDate = new Date(Math.max(...newScans.map((s: any) => new Date(s.created_at).getTime())));
        lastCheckedRef.current = maxDate;

        // Tambahkan ke state notifikasi
        const newNotifs = newScans.map((scan: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          target_url: scan.target_url,
          user_name: scan.user_name || 'Seorang pengguna',
          created_at: scan.created_at,
          risk_score: scan.risk_score
        }));

        setNotifications(prev => [...prev, ...newNotifs]);

        // Auto remove setiap notifikasi setelah 20 detik agar user sempat melihat
        newNotifs.forEach((notif: any) => {
          setTimeout(() => {
            removeNotification(notif.id);
          }, 20000);
        });
      }
    };

    // Polling setiap 15 detik
    const intervalId = setInterval(checkNewScans, 15000);

    return () => clearInterval(intervalId);
  }, [supabase]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl p-4 w-72 sm:w-80 pointer-events-auto relative overflow-hidden"
          >
            {/* Dekorasi indikator bahaya */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${notif.risk_score > 70 ? 'bg-red-500' : notif.risk_score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} />
            
            <button 
              onClick={() => removeNotification(notif.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-start pr-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white leading-tight">
                  <span className="font-bold">{notif.user_name}</span> baru saja melakukan scan pada link:
                </p>
                <div className="mt-1 flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                  <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                    {notif.target_url}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
