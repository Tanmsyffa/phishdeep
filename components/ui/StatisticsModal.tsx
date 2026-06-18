"use client";

import { useEffect, useRef } from "react";
import { X, ShieldAlert, AlertCircle, CheckCircle, Link as LinkIcon, Smartphone, BarChart2 } from "lucide-react";

interface ScanStat {
  risk_score: number;
  target_type: string;
}

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
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.43;
    const innerR = size * 0.28;

    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = "#e5e7eb";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = "transparent";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      return;
    }

    const segments = [
      { value: dangerous, color: "#ef4444" },
      { value: suspicious, color: "#f59e0b" },
      { value: safe, color: "#22c55e" },
    ].filter(s => s.value > 0);

    let startAngle = -Math.PI / 2;
    const gap = 0.04;

    segments.forEach(seg => {
      const sliceAngle = (seg.value / total) * (Math.PI * 2) - gap;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sliceAngle + gap / 2);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle + gap;
    });

    // Cut inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [dangerous, suspicious, safe, total]);

  return <canvas ref={canvasRef} width={160} height={160} className="drop-shadow-md" />;
}

export default function StatisticsModal({ isOpen, onClose, stats }: StatisticsModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const { total, dangerous, suspicious, safe, linkCount, apkCount, avgRisk } = stats;

  const riskLevel = avgRisk > 70 ? { label: "Tinggi", color: "text-red-500" } :
    avgRisk > 30 ? { label: "Sedang", color: "text-yellow-500" } :
    { label: "Rendah", color: "text-green-500" };

  const metrics = [
    { label: "Total Scan", value: total, icon: <BarChart2 className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Berbahaya", value: dangerous, icon: <ShieldAlert className="w-5 h-5 text-red-500" />, bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Mencurigakan", value: suspicious, icon: <AlertCircle className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Aman", value: safe, icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-7 py-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Statistik Lengkap</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ringkasan semua aktivitas scan Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className={`${m.bg} rounded-2xl p-4 flex flex-col gap-2`}>
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/50 flex items-center justify-center shadow-sm">
                  {m.icon}
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{m.value}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Donut Chart */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 flex flex-col items-center justify-center">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 self-start">Distribusi Hasil</p>
              {total > 0 ? (
                <>
                  <DonutChart dangerous={dangerous} suspicious={suspicious} safe={safe} total={total} />
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center text-xs font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Berbahaya ({dangerous})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />Mencurigakan ({suspicious})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Aman ({safe})</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-10">Belum ada data scan</p>
              )}
            </div>

            {/* Right stats */}
            <div className="space-y-3">
              {/* Scan type breakdown */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Jenis Target</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-500" /> Link
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">{linkCount}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: total > 0 ? `${(linkCount / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-green-500" /> APK
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">{apkCount}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: total > 0 ? `${(apkCount / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Risk */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Rata-rata Risiko</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-4xl font-extrabold ${riskLevel.color}`}>{Math.round(avgRisk)}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm mb-1">/100</span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${avgRisk > 70 ? 'bg-red-500' : avgRisk > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(avgRisk, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Level ancaman rata-rata: <span className={`font-bold ${riskLevel.color}`}>{riskLevel.label}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
