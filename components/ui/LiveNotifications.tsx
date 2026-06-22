'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, X, Bell } from 'lucide-react';

interface ScanNotification {
  id: string;
  target_url: string;
  user_name: string;
  created_at: string;
  risk_score: number;
  // Timestamp kapan notifikasi ini masuk (bukan waktu scan)
  receivedAt: number;
}

// Durasi tampil notifikasi setelah user KEMBALI ke tab (ms)
const VISIBLE_DURATION_MS = 15000;

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<ScanNotification[]>([]);
  const supabase = createClient();
  const lastCheckedRef = useRef<Date>(new Date());

  // Simpan timeout per notif id
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    timersRef.current.delete(id);
  }, []);

  // Jadwalkan penghapusan notifikasi HANYA jika tab sedang aktif/visible
  const scheduleRemoval = useCallback((id: string) => {
    // Batalkan timer lama jika ada
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);

    if (document.visibilityState === 'visible') {
      const timer = setTimeout(() => removeNotification(id), VISIBLE_DURATION_MS);
      timersRef.current.set(id, timer);
    }
    // Jika tab hidden, tidak jadwalkan — nanti ditangani oleh visibilitychange
  }, [removeNotification]);

  // Saat user KEMBALI ke tab, mulai timer untuk semua notifikasi yang menunggu
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNotifications(prev => {
          prev.forEach(notif => scheduleRemoval(notif.id));
          return prev;
        });
      } else {
        // Tab disembunyikan — hentikan semua timer agar notif tidak hilang
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current.clear();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [scheduleRemoval]);

  // Polling setiap 15 detik untuk cek scan baru
  useEffect(() => {
    const checkNewScans = async () => {
      const { data, error } = await supabase.rpc('get_community_scans');
      if (error || !data || data.length === 0) return;

      const newScans = data.filter((scan: any) => new Date(scan.created_at) > lastCheckedRef.current);

      if (newScans.length > 0) {
        const maxDate = new Date(Math.max(...newScans.map((s: any) => new Date(s.created_at).getTime())));
        lastCheckedRef.current = maxDate;

        const newNotifs: ScanNotification[] = newScans.map((scan: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          target_url: scan.target_url,
          user_name: scan.user_name || 'Seorang pengguna',
          created_at: scan.created_at,
          risk_score: scan.risk_score,
          receivedAt: Date.now(),
        }));

        setNotifications(prev => [...prev, ...newNotifs]);

        // Jadwalkan penghapusan — hanya jika tab sedang aktif
        newNotifs.forEach(notif => scheduleRemoval(notif.id));
      }
    };

    const intervalId = setInterval(checkNewScans, 15000);
    return () => clearInterval(intervalId);
  }, [supabase, scheduleRemoval]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

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
            {/* Indikator bahaya di sisi kiri */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${notif.risk_score > 70 ? 'bg-red-500' : notif.risk_score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} />

            <button
              onClick={() => removeNotification(notif.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-start pr-5">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900 dark:text-white leading-tight">
                  <span className="font-bold">{notif.user_name}</span> baru saja scan:
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                  <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                    {notif.target_url}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {notif.risk_score > 70 ? '🔴 Berbahaya' : notif.risk_score > 30 ? '🟡 Mencurigakan' : '🟢 Aman'} · Skor {notif.risk_score}/100
                </p>
              </div>
            </div>

            {/* Progress bar countdown — muncul saat tab aktif */}
            <motion.div
              className={`absolute bottom-0 left-0 h-0.5 ${notif.risk_score > 70 ? 'bg-red-400' : notif.risk_score > 30 ? 'bg-yellow-400' : 'bg-green-400'}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: VISIBLE_DURATION_MS / 1000, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
