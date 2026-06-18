"use client";

import { useEffect, useRef } from "react";
import { X, ShieldAlert, AlertCircle, CheckCircle, Link as LinkIcon, Smartphone, BarChart2 } from "lucide-react";

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    dangerous: number;
    suspicious: number;
    safe: number;
    linkCount: number;
    apkCount: number;
    avgRisk: number;
  };
}

function DonutChart({ dangerous, suspicious, safe, total }: { dangerous: number; suspicious: number; safe: number; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.43, innerR = size * 0.27;
    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = "#e2e8f0"; ctx.fill();
    } else {
      const segments = [
        { value: dangerous, color: "#ef4444" },
        { value: suspicious, color: "#f59e0b" },
        { value: safe, color: "#22c55e" },
      ].filter(s => s.value > 0);
      let startAngle = -Math.PI / 2;
      const gap = 0.06;
      segments.forEach(seg => {
        const sliceAngle = (seg.value / total) * (Math.PI * 2) - gap;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sliceAngle + gap / 2);
        ctx.closePath(); ctx.fillStyle = seg.color; ctx.fill();
        startAngle += sliceAngle + gap;
      });
    }
    // punch hole
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [dangerous, suspicious, safe, total]);

  return <canvas ref={canvasRef} width={120} height={120} />;
}

export default function StatisticsModal({ isOpen, onClose, stats }: StatisticsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { total, dangerous, suspicious, safe, linkCount, apkCount, avgRisk } = stats;
  const riskColor = avgRisk > 70 ? "text-red-500" : avgRisk > 30 ? "text-yellow-500" : "text-green-500";
  const riskBg = avgRisk > 70 ? "bg-red-500" : avgRisk > 30 ? "bg-yellow-500" : "bg-green-500";
  const riskLabel = avgRisk > 70 ? "Tinggi" : avgRisk > 30 ? "Sedang" : "Rendah";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — fixed size, no scroll */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Statistik Komunitas</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Data scan dari semua pengguna PhishDeep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Top metrics row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: total, icon: <BarChart2 className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Berbahaya", value: dangerous, icon: <ShieldAlert className="w-4 h-4" />, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
              { label: "Mencurigakan", value: suspicious, icon: <AlertCircle className="w-4 h-4" />, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
              { label: "Aman", value: safe, icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
            ].map(m => (
              <div key={m.label} className={`${m.bg} rounded-xl p-3 flex flex-col gap-1.5`}>
                <span className={m.color}>{m.icon}</span>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{m.value}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Donut chart */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-3">Distribusi Hasil</p>
              {total > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <DonutChart dangerous={dangerous} suspicious={suspicious} safe={safe} total={total} />
                  <div className="w-full space-y-1.5">
                    {[
                      { label: "Berbahaya", val: dangerous, color: "bg-red-500" },
                      { label: "Mencurigakan", val: suspicious, color: "bg-yellow-500" },
                      { label: "Aman", val: safe, color: "bg-green-500" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                          {item.label}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada data</p>
              )}
            </div>

            {/* Right: Type + Risk */}
            <div className="space-y-3">
              {/* Jenis target */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-3">Jenis Target</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Link", val: linkCount, icon: <LinkIcon className="w-3 h-3 text-blue-500" />, bar: "bg-blue-500" },
                    { label: "APK", val: apkCount, icon: <Smartphone className="w-3 h-3 text-green-500" />, bar: "bg-green-500" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300 font-medium">{item.icon}{item.label}</span>
                        <span className="font-bold text-gray-800 dark:text-white">{item.val}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.bar} rounded-full`} style={{ width: total > 0 ? `${(item.val / total) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avg Risk */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">Rata-rata Risiko</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-3xl font-extrabold leading-none ${riskColor}`}>{Math.round(avgRisk)}</span>
                  <span className="text-gray-400 text-xs mb-0.5">/100</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${riskBg}`} style={{ width: `${Math.min(avgRisk, 100)}%` }} />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Level: <span className={`font-bold ${riskColor}`}>{riskLabel}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
