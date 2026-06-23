'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, X, WifiOff, Users } from 'lucide-react';

interface ScanNotification {
  id: string;
  target_url: string;
  user_name: string;
  created_at: string;
  risk_score: number;
}

const VISIBLE_DURATION_MS = 6000;
const MAX_VISIBLE = 3;

type ConnectionStatus = 'connecting' | 'connected' | 'error';

function getRiskStyle(score: number) {
  if (score > 70) return { color: 'text-red-500', bg: 'bg-red-500', label: 'Bahaya', dot: 'bg-red-500' };
  if (score > 30) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Waspada', dot: 'bg-amber-400' };
  return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Aman', dot: 'bg-emerald-500' };
}

function truncateUrl(url: string, maxLen = 32): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return host.length > maxLen ? host.slice(0, maxLen) + '…' : host;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + '…' : url;
  }
}

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<ScanNotification[]>([]);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');
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
        setNotifications(prev => { prev.forEach(n => scheduleRemoval(n.id)); return prev; });
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
    let channel: ReturnType<typeof supabase.channel>;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;
    const currentTimers = timersRef.current;

    const subscribe = async () => {
      if (!isMounted) return;
      setConnStatus('connecting');
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      currentUserIdRef.current = user?.id ?? null;
      if (channel) { try { await supabase.removeChannel(channel); } catch {} }

      channel = supabase
        .channel(`live-scans-${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, (payload) => {
          const newRow = payload.new as any;
          if (newRow.status === 'deleted') return;
          if (currentUserIdRef.current && newRow.user_id === currentUserIdRef.current) return;

          const notif: ScanNotification = {
            id: `notif-${newRow.id || Math.random().toString(36).substr(2, 9)}`,
            target_url: newRow.target_url,
            user_name: newRow.user_name || 'Pengguna',
            created_at: newRow.created_at,
            risk_score: newRow.risk_score ?? 0,
          };

          setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            // Keep only MAX_VISIBLE, drop oldest if needed
            const next = [...prev, notif];
            return next.slice(-MAX_VISIBLE);
          });
          scheduleRemoval(notif.id);
        })
        .subscribe((status, err) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            setConnStatus('connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('[LiveNotif]', status, err);
            setConnStatus('error');
            retryTimeout = setTimeout(() => { if (isMounted) subscribe(); }, 5000);
          }
        });
    };

    subscribe();
    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      try { if (channel) supabase.removeChannel(channel); } catch {}
      currentTimers.forEach(t => clearTimeout(t));
    };
  }, [scheduleRemoval]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">

      {/* Connection pill — only show when NOT connected */}
      <AnimatePresence>
        {connStatus !== 'connected' && (
          <motion.div
            key="conn-status"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md shadow-sm pointer-events-auto ${
              connStatus === 'error'
                ? 'bg-red-50/95 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-white/80 dark:bg-slate-900/80 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {connStatus === 'error' ? (
              <><WifiOff className="w-3 h-3" />Reconnecting…</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse inline-block" />Live Monitor</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast stack */}
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => {
          const risk = getRiskStyle(notif.risk_score);
          return (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-64 sm:w-72 relative overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/30"
            >
              {/* Left accent bar */}
              <div className={`absolute inset-y-0 left-0 w-[3px] ${risk.bg}`} />

              <div className="pl-3.5 pr-3 pt-3 pb-2.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      notif.risk_score > 70 ? 'bg-red-100 dark:bg-red-900/40' :
                      notif.risk_score > 30 ? 'bg-amber-100 dark:bg-amber-900/40' :
                      'bg-emerald-100 dark:bg-emerald-900/40'
                    }`}>
                      <Shield className={`w-3 h-3 ${risk.color}`} />
                    </div>
                    <span className={`text-[11px] font-bold tracking-wide ${risk.color}`}>
                      {risk.label}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {notif.risk_score}/100
                    </span>
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="shrink-0 text-gray-300 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors mt-0.5"
                    aria-label="Tutup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* URL */}
                <p className="mt-1.5 text-xs font-mono text-gray-700 dark:text-gray-200 truncate leading-snug">
                  {truncateUrl(notif.target_url, 36)}
                </p>

                {/* User attribution */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-gray-300 dark:text-slate-600 shrink-0" />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                    {notif.user_name}
                  </p>
                </div>
              </div>

              {/* Countdown bar */}
              <motion.div
                className={`absolute bottom-0 left-0 h-[2px] ${risk.bg} opacity-60`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: VISIBLE_DURATION_MS / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
