import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldAlert, RefreshCw, CheckCircle, Globe, Server, Link as LinkIcon, Monitor, Calendar, Clock, Shield, Lock, History, Search, FileText, Activity, Layers, Tag, History as HistoryIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ExportButtons from "@/components/ui/ExportButtons";
import ReScanButton from "@/components/ui/ReScanButton";
import ScreenshotImage from "@/components/ui/ScreenshotImage";
import { notFound } from "next/navigation";

export default async function ScanResultPage({ params, searchParams }: { params: { id: string }, searchParams: { print?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="text-center py-12">Anda harus login untuk melihat halaman ini.</div>;

  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  // Ambil riwayat komunitas untuk perbandingan historis
  const { data: communityScans } = await supabase.rpc('get_community_scans');
  
  let previousScan = null;
  if (scan && communityScans && communityScans.length > 0) {
    const historical = communityScans.filter((s: any) => 
      s.target_url === scan.target_url && 
      new Date(s.created_at).getTime() < new Date(scan.created_at).getTime()
    );
    // Sort berdasarkan yang paling baru dari riwayat masa lalu
    if (historical.length > 0) {
      historical.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      previousScan = historical[0];
    }
  }

  if (error || !scan) {
    return notFound();
  }

  // 48-hour expiration check
  const scanDate = new Date(scan.created_at).getTime();
  const now = Date.now();
  const hoursDiff = (now - scanDate) / (1000 * 60 * 60);

  if (hoursDiff > 48) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Laporan Kedaluwarsa</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Demi keamanan dan efisiensi, riwayat dan laporan scan pengguna otomatis dihapus dari akses publik/pribadi setelah 48 jam.
        </p>
        <Link href="/history" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const isDanger = scan.risk_score > 70;
  const isSuspicious = scan.risk_score > 30 && scan.risk_score <= 70;
  const isSafe = scan.risk_score <= 30;

  const results = scan.results_json || {};
  const details = results.details || [];
  const extractedCode = results.extracted_code || "";
  const domainInfo = results.domain_info || {};
  const frameworks = results.frameworks || [];
  const redirectChain = results.redirect_chain || [];
  const screenshotUrl = results.screenshot_url || "";
  const isLink = scan.target_type === 'Link';

  return (
    <div className="max-w-5xl mx-auto pb-12 print:max-w-none print:pb-0">
      
      {/* Auto Print Script */}
      {searchParams.print === 'true' && (
        <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5 sm:mb-6 print:hidden">
        <Link href="/history" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white flex items-center gap-2 transition-colors group self-start">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Riwayat
        </Link>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">#{params.id.split('-')[0]}</span>
          {isDanger && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Berbahaya
            </span>
          )}
          {isSuspicious && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 font-semibold border border-yellow-100 dark:border-yellow-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Mencurigakan
            </span>
          )}
          {isSafe && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold border border-green-100 dark:border-green-800 text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Aman
            </span>
          )}
          <ReScanButton targetUrl={scan.target_url} targetType={scan.target_type} />
          <ExportButtons data={scan} />
        </div>
      </div>

      {/* Historical Comparison Alert */}
      {previousScan && (
        <div className="mb-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 print:hidden">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <HistoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-0.5">Riwayat Ditemukan</h3>
            <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
              Target ini pernah di-scan oleh <span className="font-bold">{previousScan.user_name || 'Seorang pengguna'}</span> pada <strong>{new Date(previousScan.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</strong> dengan skor risiko awal <span className="font-bold">{previousScan.risk_score}</span>. 
              {scan.risk_score > previousScan.risk_score ? (
                <span className="text-red-600 dark:text-red-400 font-medium"> Tingkat ancaman telah meningkat sejak scan terakhir!</span>
              ) : scan.risk_score < previousScan.risk_score ? (
                <span className="text-green-600 dark:text-green-400 font-medium"> Skor risiko telah menurun sejak scan terakhir.</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400"> Tidak ada perubahan signifikan pada tingkat ancaman.</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Danger Alert Banner */}
      {isDanger && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800/60 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 print:hidden">
          <div className="w-9 h-9 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-0.5">⚠ Ancaman Berbahaya Terdeteksi!</h3>
            <p className="text-xs text-red-600 dark:text-red-400/80 leading-relaxed">
              Skor risiko <strong>{scan.risk_score}/100</strong>. Target ini terindikasi sebagai situs <strong>phishing, malware, atau penipuan</strong>. Jangan klik, masukkan data, atau instal file dari sumber ini. Segera laporkan ke pihak berwajib menggunakan bukti laporan di bawah.
            </p>
          </div>
        </div>
      )}
      {isSuspicious && (
        <div className="mb-5 flex items-start gap-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-800/60 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 print:hidden">
          <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-0.5">Perlu Kewaspadaan</h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-400/80 leading-relaxed">
              Skor risiko <strong>{scan.risk_score}/100</strong>. Ditemukan beberapa anomali mencurigakan. Lakukan verifikasi manual sebelum berinteraksi dengan target ini.
            </p>
          </div>
        </div>
      )}

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block mb-8">
        {/* Top classification banner */}
        <div className="bg-gray-900 text-white text-center py-1.5 text-[7pt] font-bold tracking-[0.2em] uppercase mb-6">
          CONFIDENTIAL — CYBERSECURITY FORENSIC REPORT — AUTHORIZED USE ONLY
        </div>

        {/* Logo + Title row */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg">PD</span>
            </div>
            <div>
              <div className="text-[8pt] font-bold text-gray-500 tracking-widest uppercase">PhishDeep Intelligence Platform</div>
              <h1 className="text-[18pt] font-black text-gray-900 tracking-tight leading-tight">Cybersecurity Threat Analysis Report</h1>
              <div className="text-[8pt] text-gray-500 mt-0.5">Automated Forensic &amp; OSINT Intelligence Report</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-[9pt] font-black px-3 py-1 rounded mb-2 inline-block ${ isDanger ? 'bg-red-100 text-red-700 border border-red-300' : isSuspicious ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-green-100 text-green-700 border border-green-300' }`}>
              {isDanger ? '⚠ HIGH RISK' : isSuspicious ? '⚡ SUSPICIOUS' : '✓ CLEAN'}
            </div>
            <div className="text-[7.5pt] text-gray-500 font-mono">Report ID: {scan.id}</div>
            <div className="text-[7.5pt] text-gray-500 font-mono">Generated: {new Date(scan.created_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</div>
          </div>
        </div>

        {/* Key Metadata Table */}
        <table className="w-full text-[8pt] border border-gray-300 mb-5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-1.5 text-left font-bold text-gray-700 w-1/4">Field</th>
              <th className="border border-gray-300 px-3 py-1.5 text-left font-bold text-gray-700">Value</th>
              <th className="border border-gray-300 px-3 py-1.5 text-left font-bold text-gray-700 w-1/4">Field</th>
              <th className="border border-gray-300 px-3 py-1.5 text-left font-bold text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Target URL</td>
              <td className="border border-gray-300 px-3 py-1.5 font-mono text-gray-900 break-all">{scan.target_url}</td>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Scan Type</td>
              <td className="border border-gray-300 px-3 py-1.5 text-gray-900">{scan.target_type}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Risk Score</td>
              <td className={`border border-gray-300 px-3 py-1.5 font-black ${ isDanger ? 'text-red-700' : isSuspicious ? 'text-yellow-700' : 'text-green-700' }`}>{scan.risk_score} / 100</td>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Verdict</td>
              <td className={`border border-gray-300 px-3 py-1.5 font-bold ${ isDanger ? 'text-red-700' : isSuspicious ? 'text-yellow-700' : 'text-green-700' }`}>{isDanger ? 'MALICIOUS / HIGH RISK' : isSuspicious ? 'SUSPICIOUS — REVIEW REQUIRED' : 'CLEAN — NO SIGNIFICANT THREAT'}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Confidence Level</td>
              <td className="border border-gray-300 px-3 py-1.5 text-gray-900 font-semibold">{domainInfo.confidence_level || 'N/A'}</td>
              <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 bg-gray-50">Threat Summary</td>
              <td className="border border-gray-300 px-3 py-1.5 text-gray-900">{domainInfo.threat_summary || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 print:block print:w-full">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 print:w-full">
          
          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 print:hidden">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-sm sm:text-base print:text-lg">Ringkasan Eksekutif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              <div className={`sm:col-span-1 border rounded-xl p-4 print:border-2 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 print:border-red-600 print:bg-white dark:bg-slate-900' : isSuspicious ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800 print:border-yellow-600 print:bg-white dark:bg-slate-900' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 print:border-green-600 print:bg-white dark:bg-slate-900'}`}>
                <div className={`flex items-center gap-2 font-bold mb-2 text-sm ${isDanger ? 'text-red-600 dark:text-red-400' : isSuspicious ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isDanger || isSuspicious ? <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                  {isDanger ? 'Berisiko Tinggi' : isSuspicious ? 'Perlu Diwaspadai' : 'Terlihat Aman'}
                </div>
                <p className={`text-xs leading-relaxed ${isDanger ? 'text-red-700 dark:text-red-400 print:text-black' : isSuspicious ? 'text-yellow-700 dark:text-yellow-400 print:text-black' : 'text-green-700 dark:text-green-400 print:text-black'}`}>
                  {domainInfo.threat_summary ? domainInfo.threat_summary : (isDanger ? 'Aktivitas berbahaya terdeteksi. Sistem menyarankan untuk memblokir interaksi dengan target ini segera.' : isSuspicious ? 'Ditemukan beberapa anomali. Harap berhati-hati dan lakukan verifikasi manual.' : 'Tidak ditemukan ancaman signifikan pada saat pemindaian dilakukan.')}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-center print:bg-white dark:bg-slate-900 print:border-gray-300">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skor Risiko Total</div>
                <div className={`text-2xl sm:text-3xl font-bold flex items-end gap-1 ${isDanger ? 'text-red-600 dark:text-red-400' : isSuspicious ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {scan.risk_score} <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">/ 100</span>
                </div>
                {domainInfo.confidence_level && (
                  <div className="mt-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest print:text-gray-600">
                    Confidence: {domainInfo.confidence_level.split(' ')[0]}
                  </div>
                )}
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden print:hidden">
                  <div className={`h-1.5 rounded-full ${isDanger ? 'bg-red-500' : isSuspicious ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${scan.risk_score}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-center print:bg-white dark:bg-slate-900 print:border-gray-300">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target Analisis</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white break-all line-clamp-2" title={scan.target_url}>{scan.target_url}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 print:bg-gray-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded-md self-start">{scan.target_type}</div>
              </div>
            </div>
          </div>

          {/* Detailed Intelligence Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:break-inside-avoid">
            {/* Domain / WHOIS Box */}
            {Object.keys(domainInfo).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-4 col-span-full">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2 print:border-b print:border-gray-300 print:pb-1 print:mb-2 print:text-base"><Globe className="w-4 h-4 text-primary-500 print:hidden" /> <span className="print:hidden">Informasi Domain (RDAP & OSINT)</span><span className="hidden print:inline">Detail Analisis Keamanan</span></h3>

                {/* --- PRINT ONLY: Simple List Format --- */}
                <div className="hidden print:block text-xs text-black leading-relaxed">
                  <ul className="columns-2 space-y-1 list-none">
                    {domainInfo.domain && <li><strong>Domain:</strong> {domainInfo.domain}</li>}
                    {domainInfo.ip_address && <li><strong>IP Server:</strong> {domainInfo.ip_address}</li>}
                    {domainInfo.registrar && <li><strong>Registrar:</strong> {domainInfo.registrar}</li>}
                    {domainInfo.age_days != null && <li><strong>Umur:</strong> {domainInfo.age_days < 365 ? `${domainInfo.age_days} hari` : `${(domainInfo.age_days/365).toFixed(1)} tahun`}</li>}
                    {domainInfo.creation_date && <li><strong>Terdaftar:</strong> {domainInfo.creation_date}</li>}
                    {domainInfo.expiry_date && domainInfo.expiry_date !== 'Unknown' && <li><strong>Kadaluarsa:</strong> {domainInfo.expiry_date}</li>}
                    {domainInfo.ssl_issuer && domainInfo.ssl_issuer !== 'Unknown' && <li><strong>SSL Issuer:</strong> {domainInfo.ssl_issuer}</li>}
                    {domainInfo.geo_country && <li><strong>Lokasi:</strong> {domainInfo.geo_city}, {domainInfo.geo_country} {domainInfo.geo_isp ? `(${domainInfo.geo_isp})` : ''}</li>}
                    {domainInfo.urlscan_total !== undefined && <li><strong>URLScan.io:</strong> {domainInfo.urlscan_malicious > 0 ? `${domainInfo.urlscan_malicious} Berbahaya` : 'Bersih'}</li>}
                    {domainInfo.virustotal_malicious !== undefined && <li><strong>VirusTotal:</strong> {domainInfo.virustotal_malicious} Malicious, {domainInfo.virustotal_suspicious} Suspicious</li>}
                    {domainInfo.abuseipdb_score !== undefined && <li><strong>AbuseIPDB Score:</strong> {domainInfo.abuseipdb_score}% ({domainInfo.abuseipdb_reports} laporan)</li>}
                  </ul>
                </div>

                <div className="print:hidden">
                {/* Row 1 — Identity */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wide">Domain</span>
                    </div>
                    <div className="font-mono font-semibold text-gray-900 dark:text-white text-xs truncate">{domainInfo.domain || 'N/A'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                      <Server className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wide">IP Server</span>
                    </div>
                    <div className="font-mono font-semibold text-gray-900 dark:text-white text-xs">{domainInfo.ip_address || 'N/A'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wide">Registrar</span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-xs line-clamp-2 leading-snug">{domainInfo.registrar || 'N/A'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wide">Umur Domain</span>
                    </div>
                    {domainInfo.age_days != null ? (
                      <div className={`font-bold text-xs ${domainInfo.age_days < 30 ? 'text-red-600 dark:text-red-400' : domainInfo.age_days < 180 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                        {domainInfo.age_days < 365 ? `${domainInfo.age_days} hari` : `${(domainInfo.age_days/365).toFixed(1)} thn`}
                        {domainInfo.age_days < 30 && <span className="ml-1">⚠️</span>}
                      </div>
                    ) : <div className="text-xs text-gray-400 dark:text-gray-500">N/A</div>}
                  </div>
                </div>

                {/* Row 2 — Dates, SSL, Wayback */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wide">Terdaftar</span>
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{domainInfo.creation_date || 'N/A'}</div>
                  </div>
                  {domainInfo.expiry_date && domainInfo.expiry_date !== 'Unknown' && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">Kadaluarsa</span>
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{domainInfo.expiry_date}</div>
                    </div>
                  )}
                  {domainInfo.last_updated && domainInfo.last_updated !== 'Unknown' && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">Diperbarui</span>
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{domainInfo.last_updated}</div>
                    </div>
                  )}
                  {domainInfo.ssl_issuer && domainInfo.ssl_issuer !== 'Unknown' && (
                    <div className={`rounded-xl p-3 border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border ${domainInfo.ssl_issuer.includes('Invalid') ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 print:border-red-300' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 print:border-gray-200 dark:border-slate-700'}`}>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">SSL Issuer</span>
                      </div>
                      <div className={`text-xs font-semibold leading-snug ${domainInfo.ssl_issuer.includes('Invalid') ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{domainInfo.ssl_issuer}</div>
                    </div>
                  )}
                  {domainInfo.wayback_first_seen && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <History className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">Wayback Pertama</span>
                      </div>
                      <div className={`text-xs font-medium ${domainInfo.wayback_first_seen === 'Tidak ditemukan' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{domainInfo.wayback_first_seen}</div>
                    </div>
                  )}
                  {domainInfo.wayback_last_seen && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <History className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">Wayback Terakhir</span>
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{domainInfo.wayback_last_seen}</div>
                    </div>
                  )}
                </div>

                {/* Row 3 — Geo + Threat Intel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {domainInfo.geo_country && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 col-span-2 sm:col-span-1 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">Lokasi Server</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{domainInfo.geo_city}, {domainInfo.geo_country}</div>
                      <div className="text-[9px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{domainInfo.geo_isp}</div>
                      {domainInfo.geo_hosting && <span className="text-[8px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded mt-1 inline-block">Datacenter</span>}
                    </div>
                  )}
                  {domainInfo.urlscan_total !== undefined && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">URLScan.io</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${domainInfo.urlscan_malicious > 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'}`}>
                        {domainInfo.urlscan_malicious > 0 ? `⚠️ ${domainInfo.urlscan_malicious} Berbahaya` : '✅ Bersih'}
                      </span>
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">{domainInfo.urlscan_total} riwayat scan</div>
                    </div>
                  )}
                  {domainInfo.dns_ttl !== undefined && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">DNS TTL</span>
                      </div>
                      <div className={`text-xs font-bold ${domainInfo.dns_ttl < 300 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>{domainInfo.dns_ttl}s {domainInfo.dns_ttl < 300 ? '⚠️' : '✓'}</div>
                    </div>
                  )}
                  {domainInfo.cert_count !== undefined && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] print:border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold tracking-wide">crt.sh Certs</span>
                      </div>
                      <div className={`text-xs font-bold ${domainInfo.cert_count > 50 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{domainInfo.cert_count}</div>
                    </div>
                  )}
                </div>

                {/* Advanced Security Intelligence (VirusTotal & AbuseIPDB) */}
                {(domainInfo.virustotal_malicious !== undefined || domainInfo.virustotal_error || domainInfo.abuseipdb_score !== undefined) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {domainInfo.virustotal_malicious !== undefined && (
                      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3 print:border-gray-300">
                        <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wide mb-0.5">VirusTotal Intelligence</div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            <span className={domainInfo.virustotal_malicious > 0 ? "text-red-600" : ""}>{domainInfo.virustotal_malicious} Malicious</span>
                            <span className="mx-1.5 text-gray-300">|</span>
                            <span className={domainInfo.virustotal_suspicious > 0 ? "text-yellow-600" : ""}>{domainInfo.virustotal_suspicious} Suspicious</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {domainInfo.virustotal_error && (
                      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3 print:border-gray-300">
                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wide mb-0.5">VirusTotal Intelligence</div>
                          <div className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 leading-snug">
                            ℹ️ {domainInfo.virustotal_error}
                          </div>
                        </div>
                      </div>
                    )}
                    {domainInfo.abuseipdb_score !== undefined && (
                      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3 print:border-gray-300">
                        <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wide mb-0.5">AbuseIPDB Score</div>
                          <div className={`text-xs font-bold ${domainInfo.abuseipdb_score >= 50 ? 'text-red-600' : domainInfo.abuseipdb_score > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {domainInfo.abuseipdb_score}% <span className="text-gray-400 font-normal">({domainInfo.abuseipdb_reports} laporan)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 4 — Security signals as badges */}
                <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                  {domainInfo.safe_browsing && domainInfo.safe_browsing !== 'Unchecked' && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${domainInfo.safe_browsing === 'Clean' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200'}`}>
                      {domainInfo.safe_browsing === 'Clean' ? <CheckCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                      Safe Browsing: {domainInfo.safe_browsing === 'Clean' ? 'Clean' : 'MALICIOUS'}
                    </span>
                  )}
                  {domainInfo.tld_risk && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${domainInfo.tld_risk === 'Normal' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200'}`}>
                      <Tag className="w-3 h-3" />
                      TLD: {domainInfo.tld_risk === 'Normal' ? 'Normal' : `⚠️ ${domainInfo.tld_risk.split('—')[0].trim()}`}
                    </span>
                  )}
                  {domainInfo.spf_record !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${domainInfo.spf_record === 'Tidak Ada' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200'}`}>
                      SPF {domainInfo.spf_record === 'Tidak Ada' ? '✗' : '✓'}
                    </span>
                  )}
                  {domainInfo.dmarc_record !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${domainInfo.dmarc_record === 'Tidak Ada' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200'}`}>
                      DMARC {domainInfo.dmarc_record === 'Tidak Ada' ? '✗' : '✓'}
                    </span>
                  )}
                  {domainInfo.hidden_iframe_count > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200">
                      <AlertTriangle className="w-3 h-3" /> {domainInfo.hidden_iframe_count} iFrame Tersembunyi
                    </span>
                  )}
                  {domainInfo.external_links_count !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${domainInfo.external_links_count > 20 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200' : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}>
                      <LinkIcon className="w-3 h-3" /> {domainInfo.external_links_count} Link Eksternal
                    </span>
                  )}
                  {domainInfo.form_actions?.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200">
                      <AlertTriangle className="w-3 h-3" /> Form Kirim ke Luar
                    </span>
                  )}
                  {domainInfo.domain_status?.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700" title={domainInfo.domain_status.join(', ')}>
                      <Lock className="w-3 h-3" /> {domainInfo.domain_status.length} Status Lock
                    </span>
                  )}
                  {domainInfo.wayback_snapshot_url && (
                    <a href={domainInfo.wayback_snapshot_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 transition-colors">
                      <History className="w-3 h-3" /> Lihat Snapshot
                    </a>
                  )}
                </div>
                </div>
              </div>
            )}


            {/* Framework Box */}
            {frameworks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2 print:hidden"><Server className="w-4 h-4 text-primary-500 print:hidden" /> Teknologi & Stack</h3>
                
                {/* --- PRINT ONLY --- */}
                <div className="hidden print:block text-xs text-black leading-relaxed">
                  <p><strong>Teknologi & Stack:</strong> {frameworks.map((fw: string) => fw.replace('PERINGATAN - HEADER TIDAK ADA:', 'Warning Missing Header:')).join(', ')}</p>
                </div>

                <div className="flex flex-wrap gap-2 print:hidden">
                  {frameworks.map((fw: string, idx: number) => {
                    const colonIdx = fw.indexOf(':');
                    const isColon = colonIdx > -1;
                    const label = isColon ? fw.substring(0, colonIdx).trim() : fw;
                    const value = isColon ? fw.substring(colonIdx + 1).trim() : 'Terdeteksi';
                    const isWarning = label.toLowerCase().includes('peringatan') || fw.toLowerCase().includes('peringatan');
                    
                    let badgeColor = 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                    if (label.includes('Web Server') || label.includes('Proxy')) badgeColor = 'bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
                    else if (label.includes('CDN')) badgeColor = 'bg-orange-50 dark:bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/50';
                    else if (label.includes('Backend') || label.includes('PHP') || label.includes('Python')) badgeColor = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
                    else if (label.includes('CMS')) badgeColor = 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
                    else if (label.includes('Analytics')) badgeColor = 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50';
                    else if (label.includes('Security') || label.includes('PERINGATAN') || label.includes('WAF')) badgeColor = 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50';
                    else if (label.includes('CSS') || label.includes('JS') || label.includes('Library') || label.includes('Framework')) badgeColor = 'bg-pink-50 dark:bg-pink-500/10 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800/50';

                    return (
                      <div key={idx} className={`flex flex-col px-3 py-2 rounded-lg border shadow-sm max-w-full ${badgeColor} ${isWarning ? 'ring-1 ring-red-400 dark:ring-red-500' : ''}`}>
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-70 mb-0.5 truncate">{label}</span>
                        <span className={`text-xs font-bold ${isWarning ? 'text-red-700 dark:text-red-400' : ''} leading-tight break-words whitespace-normal`}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Redirect Chain */}
          {redirectChain.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-4 print:break-inside-avoid">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2 print:hidden"><LinkIcon className="w-4 h-4 text-primary-500 print:hidden" /> Jejak Redirect (Redirect Chain)</h3>
              
              {/* --- PRINT ONLY --- */}
              <div className="hidden print:block text-xs text-black leading-relaxed font-mono mt-2">
                <p className="font-bold mb-1 font-sans">Jejak Redirect:</p>
                <ol className="list-decimal list-inside space-y-1">
                  {redirectChain.map((url: string, idx: number) => (
                    <li key={idx} className="break-all">{url}</li>
                  ))}
                </ol>
              </div>

              <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700 print:hidden">
                {redirectChain.map((url: string, idx: number) => (
                  <div key={idx} className="relative flex items-center gap-3">
                    <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-white print:ring-0"></div>
                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2 flex-1 break-all text-xs text-gray-700 dark:text-gray-300 font-mono print:bg-white dark:bg-slate-900 print:border-gray-300">
                      {url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshot / Visual Evidence */}
          {isLink && screenshotUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-gray-300 print:shadow-none print:break-inside-avoid">
              <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary-500 shrink-0" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Bukti Visual (Tangkapan Layar)</h3>
                <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 font-medium rounded-md px-2.5 py-1 hidden sm:block">
                  Diambil saat analisis
                </span>
              </div>
              <div className="p-5 sm:p-6 bg-gray-50 dark:bg-slate-800/50 flex justify-center">
                <div className="w-full max-w-4xl rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                  {/* Mock Browser Top Bar */}
                  <div className="h-8 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    <div className="mx-auto flex-1 flex justify-center px-8">
                      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-[10px] text-gray-400 dark:text-gray-500 px-3 py-0.5 max-w-[200px] w-full truncate text-center">
                        {scan.target_url}
                      </div>
                    </div>
                  </div>
                  {/* Image Container */}
                  <div className="bg-white dark:bg-slate-900">
                    <ScreenshotImage src={screenshotUrl} targetUrl={scan.target_url} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Log Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-none print:shadow-none print:break-inside-avoid">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 print:border-b print:border-gray-300 print:bg-white print:p-0 print:pb-1 print:mb-2">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2 print:text-base">
                <ShieldAlert className="w-4 h-4 text-primary-500 print:hidden" /> Log Audit Keamanan
              </h2>
            </div>
            
            {/* --- PRINT ONLY --- */}
            <div className="hidden print:block text-xs text-black leading-relaxed mb-4">
              {details.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1.5">
                  {details.map((item: any, idx: number) => {
                    const tagMatch = item.step.match(/\[([A-Z0-9.:-]+)\]/);
                    const tag = tagMatch ? tagMatch[1] : null;
                    const cleanStep = item.step.replace(/\[([A-Z0-9.:-]+)\]/, '').trim();
                    return (
                      <li key={idx} className="break-inside-avoid">
                        <strong>{cleanStep}</strong> {tag && <span className="text-[10px] ml-1">({tag})</span>}
                        <div className="ml-4 mt-0.5 text-[11px] text-gray-800">{item.finding}</div>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p>Tidak ada detail langkah analisis yang tersedia.</p>
              )}
            </div>

            <div className="p-4 sm:p-5 print:hidden">
              {details.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.map((item: any, idx: number) => {
                    // Extract MITRE ATT&CK tag if present (e.g., [T1566] or [T1566.002])
                    const tagMatch = item.step.match(/\[([A-Z0-9.:-]+)\]/);
                    const tag = tagMatch ? tagMatch[1] : null;
                    const cleanStep = item.step.replace(/\[([A-Z0-9.:-]+)\]/, '').trim();

                    return (
                      <div key={idx} className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 print:border-gray-300 print:bg-white dark:bg-slate-900 relative">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 print:border print:border-gray-300">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs flex items-center gap-2 flex-wrap">
                            <span className="leading-snug">{cleanStep}</span>
                            {tag && (
                              <span className="text-[8px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200 px-1.5 py-0.5 rounded-md tracking-widest font-mono shrink-0">
                                {tag}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed print:text-black">{item.finding}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Tidak ada detail langkah analisis yang tersedia.</p>
              )}

              {extractedCode && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 print:border-gray-300">
                  <h3 className="font-bold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 print:text-black" /> Anotasi Ekstraksi Kode
                  </h3>
                  <div className="bg-gray-900 rounded-xl p-3 overflow-y-auto max-h-[200px] text-[10px] sm:text-xs text-green-400 font-mono print:bg-white dark:bg-slate-900 print:border print:border-gray-300 print:text-black print:max-h-none print:whitespace-pre-wrap print:overflow-hidden">
                    <pre className="print:whitespace-pre-wrap whitespace-pre-wrap break-all leading-relaxed"><code>{extractedCode}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
            <Link href="/scan" className="flex-1 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 font-semibold py-3 px-5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
              <RefreshCw className="w-4 h-4" /> Scan Ulang Target Lain
            </Link>
          </div>
        </div>

        {/* Right Column: Sidebar - Hidden on Print */}
        <div className="space-y-4 sm:space-y-6 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 sm:p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">Informasi Metadata</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">Waktu Scan</span>
                <span className="font-medium text-right text-gray-900 dark:text-white">{new Date(scan.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">Tipe Entitas</span>
                <span className="font-medium text-right text-gray-900 dark:text-white">{scan.target_type}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">Status Sistem</span>
                <span className="font-medium text-right text-green-600 dark:text-green-400">Terverifikasi</span>
              </div>
              <div className="flex justify-between gap-2 pt-1">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">ID Laporan</span>
                <span className="font-mono text-xs text-right text-gray-500 dark:text-gray-400">{scan.id.split('-')[0]}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Penafian Laporan</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Laporan ini dibuat otomatis menggunakan teknik <i>static & dynamic analysis</i> tanpa manipulasi.
              Sistem PhishDeep tidak bertanggung jawab atas kerugian yang ditimbulkan akibat salah tafsir terhadap data ini.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
