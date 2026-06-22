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
}

const VISIBLE_DURATION_MS = 15000;

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<ScanNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const currentUserIdRef = useRef<string | null>(null);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    timersRef.current.delete(id);
  }, []);

  const scheduleRemoval = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);

    if (document.visibilityState === 'visible') {
      const timer = setTimeout(() => removeNotification(id), VISIBLE_DURATION_MS);
      timersRef.current.set(id, timer);
    }
  }, [removeNotification]);

  // Tangani perubahan visibilitas tab
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNotifications(prev => {
          prev.forEach(n => scheduleRemoval(n.id));
          return prev;
        });
      } else {
        timersRef.current.forEach(t => clearTimeout(t));
        timersRef.current.clear();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [scheduleRemoval]);

  // Subscribe ke Supabase Realtime
  useEffect(() => {
    const supabase = createClient();

    // Dapatkan user saat ini agar kita tidak tampilkan notif untuk diri sendiri
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserIdRef.current = user?.id ?? null;
    });

    const channel = supabase
      .channel('community-scans-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
        },
        (payload) => {
          const newRow = payload.new as any;

          // Jangan tampilkan notif untuk scan diri sendiri
          if (newRow.user_id === currentUserIdRef.current) return;
          // Skip scan yang dihapus
          if (newRow.status === 'deleted') return;

          const notif: ScanNotification = {
            id: Math.random().toString(36).substr(2, 9),
            target_url: newRow.target_url,
            user_name: newRow.user_name || 'Seorang pengguna',
            created_at: newRow.created_at,
            risk_score: newRow.risk_score ?? 0,
          };

          setNotifications(prev => [...prev, notif]);
          scheduleRemoval(notif.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [scheduleRemoval]);

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
            {/* Strip warna kiri berdasarkan tingkat bahaya */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              notif.risk_score > 70 ? 'bg-red-500' : notif.risk_score > 30 ? 'bg-yellow-500' : 'bg-green-500'
            }`} />

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

            {/* Progress bar countdown */}
            <motion.div
              className={`absolute bottom-0 left-0 h-0.5 ${
                notif.risk_score > 70 ? 'bg-red-400' : notif.risk_score > 30 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
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
