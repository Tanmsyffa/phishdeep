"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldAlert, AlertCircle, CheckCircle, Link as LinkIcon, Smartphone, BarChart2, Copy, Check, Users } from "lucide-react";

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
  scans?: any[];
}

function DonutChart({ dangerous, suspicious, safe, total }: { dangerous: number; suspicious: number; safe: number; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 100;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.42, innerR = size * 0.26;
    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(150,150,150,0.15)"; ctx.fill();
    } else {
      const segments = [
        { value: dangerous, color: "#ef4444" },
        { value: suspicious, color: "#f59e0b" },
        { value: safe, color: "#22c55e" },
      ].filter(s => s.value > 0);
      let startAngle = -Math.PI / 2;
      const gap = 0.05;
      segments.forEach(seg => {
        const sliceAngle = (seg.value / total) * (Math.PI * 2) - gap;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sliceAngle + gap / 2);
        ctx.closePath(); ctx.fillStyle = seg.color; ctx.fill();
        startAngle += sliceAngle + gap;
      });
    }
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [dangerous, suspicious, safe, total]);

  return <canvas ref={canvasRef} style={{ width: 100, height: 100 }} />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0" title="Salin ID">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function StatisticsModal({ isOpen, onClose, stats, scans = [] }: StatisticsModalProps) {

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { total, dangerous, suspicious, safe, linkCount, apkCount, avgRisk } = stats;
  const riskColor = avgRisk > 70 ? "text-red-500 dark:text-red-400" : avgRisk > 30 ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400";
  const riskBg = avgRisk > 70 ? "bg-red-500" : avgRisk > 30 ? "bg-amber-400" : "bg-emerald-500";
  const riskLabel = avgRisk > 70 ? "Tinggi" : avgRisk > 30 ? "Sedang" : "Rendah";
  const riskTrack = avgRisk > 70 ? "bg-red-100 dark:bg-red-500/20" : avgRisk > 30 ? "bg-amber-100 dark:bg-amber-400/20" : "bg-emerald-100 dark:bg-emerald-500/20";

  const groupedScans = scans.reduce((acc: any, scan: any) => {
    const key = scan.target_url;
    if (!acc[key]) acc[key] = { ...scan, count: 0, ids: [] };
    acc[key].count += 1;
    acc[key].ids.push(scan.id);
    if (new Date(scan.created_at) > new Date(acc[key].created_at)) {
      acc[key].risk_score = scan.risk_score;
      acc[key].user_name = scan.user_name || 'Seorang pengguna';
      acc[key].created_at = scan.created_at;
      acc[key].id = scan.id;
    }
    return acc;
  }, {});

  const historyList = Object.values(groupedScans).sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 15);

  const metrics = [
    { label: "Total", value: total, icon: BarChart2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/20", border: "border-blue-200 dark:border-blue-500/20", num: "text-blue-700 dark:text-white" },
    { label: "Berbahaya", value: dangerous, icon: ShieldAlert, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/20", border: "border-red-200 dark:border-red-500/20", num: "text-red-700 dark:text-white" },
    { label: "Mencurigakan", value: suspicious, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/20", border: "border-amber-200 dark:border-amber-500/20", num: "text-amber-700 dark:text-white" },
    { label: "Aman", value: safe, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/20", border: "border-emerald-200 dark:border-emerald-500/20", num: "text-emerald-700 dark:text-white" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)]
        bg-white dark:bg-[#1c1c1e]">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Statistik Komunitas</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Data scan dari semua pengguna PhishDeep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto modal-scroll">

          {/* Top metrics row — 2x2 on mobile, 4-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {metrics.map(m => (
              <div key={m.label} className={`${m.bg} rounded-xl p-3 flex flex-col gap-1`}>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                <p className={`text-xl font-bold leading-none mt-0.5 ${m.num}`}>{m.value}</p>
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Chart + Stats row — stacked on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Donut Chart — vertical layout, chart on top / legend below */}
            <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 overflow-hidden">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Distribusi Hasil</p>
              {total > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <DonutChart dangerous={dangerous} suspicious={suspicious} safe={safe} total={total} />
                  <div className="w-full space-y-1.5">
                    {[
                      { label: "Berbahaya", val: dangerous, color: "bg-red-500" },
                      { label: "Mencurigakan", val: suspicious, color: "bg-amber-400" },
                      { label: "Aman", val: safe, color: "bg-emerald-500" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                          {item.label}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">Belum ada data</p>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-3">
              {/* Jenis Target */}
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Jenis Target</p>
                <div className="space-y-3">
                  {[
                    { label: "Link", val: linkCount, icon: <LinkIcon className="w-3 h-3 text-blue-500 dark:text-blue-400" />, bar: "bg-blue-500", track: "bg-blue-100 dark:bg-blue-500/20" },
                    { label: "APK", val: apkCount, icon: <Smartphone className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />, bar: "bg-emerald-500", track: "bg-emerald-100 dark:bg-emerald-500/20" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">{item.icon}{item.label}</span>
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">{item.val}</span>
                      </div>
                      <div className={`h-1 ${item.track} rounded-full overflow-hidden`}>
                        <div className={`h-full ${item.bar} rounded-full transition-all`} style={{ width: total > 0 ? `${(item.val / total) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rata-rata Risiko */}
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Rata-rata Risiko</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-2xl font-bold leading-none ${riskColor}`}>{Math.round(avgRisk)}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-[11px]">/100</span>
                </div>
                <div className={`h-1 ${riskTrack} rounded-full overflow-hidden mb-2`}>
                  <div className={`h-full rounded-full ${riskBg} transition-all`} style={{ width: `${Math.min(avgRisk, 100)}%` }} />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Level: <span className={`font-semibold ${riskColor}`}>{riskLabel}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Riwayat Scan Komunitas */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Riwayat Terakhir Komunitas</h3>
            </div>
            {historyList.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Belum ada riwayat scan.</p>
            ) : (
              <div className="space-y-2">
                {historyList.map((item: any, idx: number) => {
                  const isDanger = item.risk_score > 70;
                  const isSusp = item.risk_score > 30 && item.risk_score <= 70;
                  const dotColor = isDanger ? "bg-red-500" : isSusp ? "bg-amber-400" : "bg-emerald-500";
                  const resultBadge = isDanger
                    ? "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                    : isSusp
                    ? "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                    : "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
                  const resultText = isDanger ? "Berbahaya" : isSusp ? "Mencurigakan" : "Aman";

                  return (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{item.target_url}</p>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate ml-3.5">
                            Oleh <span className="font-medium text-gray-600 dark:text-gray-300">{item.user_name || 'Seorang pengguna'}</span>
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 ml-3.5">
                            <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 truncate max-w-[140px]">ID: {item.id}</span>
                            <CopyButton text={item.id} />
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 border rounded-full text-[10px] font-bold ${resultBadge}`}>
                            {resultText}
                          </span>
                          {item.count > 1 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[10px] font-bold rounded-full">
                              {item.count}×
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
