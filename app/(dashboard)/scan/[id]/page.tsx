import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldAlert, RefreshCw, CheckCircle, Globe, Server, Link as LinkIcon, Monitor, Calendar, Clock, Shield, Lock, History, Search, FileText, Activity, Layers, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/ui/PrintButton";
import ExportButtons from "@/components/ui/ExportButtons";
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

  if (error || !scan) {
    return notFound();
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
          <ExportButtons data={scan} />
          <PrintButton />
        </div>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block border-b-2 border-gray-900 pb-4 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">PHISHDEEP <span className="text-gray-400 dark:text-gray-500">ANALYSIS REPORT</span></h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Laporan Forensik & Keamanan Siber Resmi</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {scan.id}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">DATE: {new Date(scan.created_at).toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 print:block print:w-full">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 print:w-full">
          
          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-sm sm:text-base print:text-lg">Ringkasan Eksekutif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              <div className={`sm:col-span-1 border rounded-xl p-4 print:border-2 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 print:border-red-600 print:bg-white dark:bg-slate-900' : isSuspicious ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800 print:border-yellow-600 print:bg-white dark:bg-slate-900' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 print:border-green-600 print:bg-white dark:bg-slate-900'}`}>
                <div className={`flex items-center gap-2 font-bold mb-2 text-sm ${isDanger ? 'text-red-600 dark:text-red-400' : isSuspicious ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isDanger || isSuspicious ? <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                  {isDanger ? 'Berisiko Tinggi' : isSuspicious ? 'Perlu Diwaspadai' : 'Terlihat Aman'}
                </div>
                <p className={`text-xs leading-relaxed ${isDanger ? 'text-red-700 dark:text-red-400 print:text-black' : isSuspicious ? 'text-yellow-700 dark:text-yellow-400 print:text-black' : 'text-green-700 dark:text-green-400 print:text-black'}`}>
                  {isDanger ? 'Aktivitas berbahaya terdeteksi. Sistem menyarankan untuk memblokir interaksi dengan target ini segera.' : isSuspicious ? 'Ditemukan beberapa anomali. Harap berhati-hati dan lakukan verifikasi manual.' : 'Tidak ditemukan ancaman signifikan pada saat pemindaian dilakukan.'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-center print:bg-white dark:bg-slate-900 print:border-gray-300">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skor Risiko Total</div>
                <div className={`text-2xl sm:text-3xl font-bold flex items-end gap-1 ${isDanger ? 'text-red-600 dark:text-red-400' : isSuspicious ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {scan.risk_score} <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">/ 100</span>
                </div>
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-gray-300 print:shadow-none print:break-inside-avoid col-span-full">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-primary-500" /> Informasi Domain (RDAP & OSINT)</h3>

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
            )}


            {/* Framework Box */}
            {frameworks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-gray-300 print:shadow-none">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2"><Server className="w-4 h-4 text-primary-500" /> Teknologi & Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {frameworks.map((fw: string, idx: number) => {
                    const colonIdx = fw.indexOf(':');
                    const isColon = colonIdx > -1;
                    const label = isColon ? fw.substring(0, colonIdx).trim() : fw;
                    const value = isColon ? fw.substring(colonIdx + 1).trim() : 'Terdeteksi';
                    const isWarning = label.toLowerCase().includes('peringatan') || fw.toLowerCase().includes('peringatan');
                    
                    let badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
                    if (label.includes('Web Server')) badgeColor = 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 border-purple-200';
                    else if (label.includes('CDN')) badgeColor = 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 border-orange-200';
                    else if (label.includes('Backend') || label.includes('PHP') || label.includes('Python')) badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                    else if (label.includes('CMS')) badgeColor = 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 border-blue-200';
                    else if (label.includes('Analytics')) badgeColor = 'bg-green-50 dark:bg-green-900/20 text-green-800 border-green-200';
                    else if (label.includes('Security') || label.includes('PERINGATAN')) badgeColor = 'bg-red-50 dark:bg-red-900/20 text-red-800 border-red-200';
                    else if (label.includes('CSS') || label.includes('JS') || label.includes('Library')) badgeColor = 'bg-pink-50 text-pink-800 border-pink-200';

                    return (
                      <div key={idx} className={`flex flex-col px-3 py-2 rounded-lg border shadow-sm ${badgeColor} ${isWarning ? 'ring-1 ring-red-400' : ''}`}>
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-70 mb-0.5">{label}</span>
                        <span className={`text-xs font-bold ${isWarning ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'} leading-tight whitespace-nowrap`}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Redirect Chain */}
          {redirectChain.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 print:border-gray-300 print:shadow-none print:break-inside-avoid">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary-500" /> Jejak Redirect (Redirect Chain)</h3>
              <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
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
                    <ScreenshotImage src={screenshotUrl} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Log Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 print:bg-white dark:bg-slate-900">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary-500" /> Log Audit Keamanan
              </h2>
            </div>
            
            <div className="p-4 sm:p-5">
              {details.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
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
        
        {/* Footer for Print Only */}
        <div className="hidden print:block print:w-full mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500 dark:text-gray-400">
          Laporan dibuat secara otomatis oleh sistem PhishDeep Security. Dokumen ini sah dan dapat digunakan sebagai referensi audit.
        </div>
      </div>
    </div>
  );
}
