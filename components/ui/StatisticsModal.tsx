"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldAlert, AlertCircle, CheckCircle, Link as LinkIcon, Smartphone, BarChart2, ExternalLink, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

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
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [dangerous, suspicious, safe, total]);

  return <canvas ref={canvasRef} width={120} height={120} />;
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
    <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0" title="Salin ID">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function StatisticsModal({ isOpen, onClose, stats, scans = [] }: StatisticsModalProps) {
  const router = useRouter();

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

  // Kelompokkan scan berdasarkan URL + simpan semua ID-nya
  const groupedScans = scans.reduce((acc: any, scan: any) => {
    const key = scan.target_url;
    if (!acc[key]) {
      acc[key] = { ...scan, count: 0, ids: [] };
    }
    acc[key].count += 1;
    acc[key].ids.push(scan.id);
    if (new Date(scan.created_at) > new Date(acc[key].created_at)) {
      acc[key].risk_score = scan.risk_score;
      acc[key].user_name = scan.user_name || 'Seorang pengguna';
      acc[key].created_at = scan.created_at;
      acc[key].id = scan.id; // most recent ID
    }
    return acc;
  }, {});

  const historyList = Object.values(groupedScans).sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 15);

  const handleViewDetail = (scanId: string) => {
    onClose();
    router.push(`/scan/${scanId}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
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

        {/* Scrollable body */}
        <div className="p-5 space-y-4 overflow-y-auto">
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

          {/* Chart + Stats row */}
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-3">
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



          {/* Riwayat Scan Komunitas */}
          <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Riwayat Terakhir Komunitas</h3>
            {historyList.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Belum ada riwayat scan.</p>
            ) : (
              <div className="space-y-2">
                {historyList.map((item: any, idx: number) => {
                  const isDanger = item.risk_score > 70;
                  const isSusp = item.risk_score > 30 && item.risk_score <= 70;
                  const dotColor = isDanger ? "bg-red-500" : isSusp ? "bg-yellow-500" : "bg-green-500";
                  const resultText = isDanger ? "Berbahaya" : isSusp ? "Mencurigakan" : "Aman";

                  return (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.target_url}</p>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            Oleh <span className="font-medium text-gray-700 dark:text-gray-300">{item.user_name || 'Seorang pengguna'}</span> · {resultText}
                          </p>
                          {/* Tampilkan ID scan terbaru */}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 truncate max-w-[180px]">ID: {item.id}</span>
                            <CopyButton text={item.id} />
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center justify-center px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md">
                            {item.count}x
                          </span>
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Detail
                          </button>
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
