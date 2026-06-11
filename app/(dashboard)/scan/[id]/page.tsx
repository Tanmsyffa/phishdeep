import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldAlert, RefreshCw, CheckCircle, Globe, Server, Link as LinkIcon, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/ui/PrintButton";
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
        <Link href="/history" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors group self-start">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Riwayat
        </Link>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">#{params.id.split('-')[0]}</span>
          {isDanger && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold border border-red-100 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Berbahaya
            </span>
          )}
          {isSuspicious && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 font-semibold border border-yellow-100 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Mencurigakan
            </span>
          )}
          {isSafe && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 font-semibold border border-green-100 text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Aman
            </span>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block border-b-2 border-gray-900 pb-4 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">PHISHDEEP <span className="text-gray-400">ANALYSIS REPORT</span></h1>
            <p className="text-sm text-gray-500 mt-1">Laporan Forensik & Keamanan Siber Resmi</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-mono">ID: {scan.id}</div>
            <div className="text-xs text-gray-500 font-mono">DATE: {new Date(scan.created_at).toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 print:block print:w-full">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 print:w-full">
          
          {/* Summary Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <h2 className="font-bold text-gray-900 mb-4 text-sm sm:text-base print:text-lg">Ringkasan Eksekutif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              <div className={`sm:col-span-1 border rounded-xl p-4 print:border-2 ${isDanger ? 'bg-red-50 border-red-100 print:border-red-600 print:bg-white' : isSuspicious ? 'bg-yellow-50 border-yellow-100 print:border-yellow-600 print:bg-white' : 'bg-green-50 border-green-100 print:border-green-600 print:bg-white'}`}>
                <div className={`flex items-center gap-2 font-bold mb-2 text-sm ${isDanger ? 'text-red-600' : isSuspicious ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isDanger || isSuspicious ? <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                  {isDanger ? 'Berisiko Tinggi' : isSuspicious ? 'Perlu Diwaspadai' : 'Terlihat Aman'}
                </div>
                <p className={`text-xs leading-relaxed ${isDanger ? 'text-red-700 print:text-black' : isSuspicious ? 'text-yellow-700 print:text-black' : 'text-green-700 print:text-black'}`}>
                  {isDanger ? 'Aktivitas berbahaya terdeteksi. Sistem menyarankan untuk memblokir interaksi dengan target ini segera.' : isSuspicious ? 'Ditemukan beberapa anomali. Harap berhati-hati dan lakukan verifikasi manual.' : 'Tidak ditemukan ancaman signifikan pada saat pemindaian dilakukan.'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center print:bg-white print:border-gray-300">
                <div className="text-xs text-gray-500 mb-1">Skor Risiko Total</div>
                <div className={`text-2xl sm:text-3xl font-bold flex items-end gap-1 ${isDanger ? 'text-red-600' : isSuspicious ? 'text-yellow-600' : 'text-green-600'}`}>
                  {scan.risk_score} <span className="text-sm text-gray-400 font-normal">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden print:hidden">
                  <div className={`h-1.5 rounded-full ${isDanger ? 'bg-red-500' : isSuspicious ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${scan.risk_score}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center print:bg-white print:border-gray-300">
                <div className="text-xs text-gray-500 mb-1">Target Analisis</div>
                <div className="text-sm font-bold text-gray-900 break-all line-clamp-2" title={scan.target_url}>{scan.target_url}</div>
                <div className="mt-1 text-xs text-gray-500 bg-gray-200 print:bg-gray-100 inline-block px-2 py-0.5 rounded-md self-start">{scan.target_type}</div>
              </div>
            </div>
          </div>

          {/* Detailed Intelligence Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:break-inside-avoid">
            {/* Domain / WHOIS Box */}
            {Object.keys(domainInfo).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print:border-gray-300 print:shadow-none">
                <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-primary-500" /> Informasi Domain (RDAP)</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="border-b border-gray-50 pb-2">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Nama Domain</div>
                    <div className="font-semibold text-gray-900 font-mono">{domainInfo.domain || 'N/A'}</div>
                  </div>
                  <div className="border-b border-gray-50 pb-2">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Registrar</div>
                    <div className="font-medium text-gray-900 break-words leading-snug">{domainInfo.registrar || 'N/A'}</div>
                  </div>
                  {domainInfo.ip_address && domainInfo.ip_address !== 'Unknown' && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Alamat IP Server</div>
                      <div className="font-semibold text-gray-900 font-mono">{domainInfo.ip_address}</div>
                    </div>
                  )}
                  {domainInfo.ssl_issuer && domainInfo.ssl_issuer !== 'Unknown' && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Sertifikat SSL (Issuer)</div>
                      <div className={`font-medium ${domainInfo.ssl_issuer.includes('Invalid') ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{domainInfo.ssl_issuer}</div>
                      {domainInfo.ssl_expiry_date && domainInfo.ssl_expiry_date !== 'Unknown' && (
                        <div className="text-[10px] text-gray-500 mt-0.5">Berlaku s/d: {domainInfo.ssl_expiry_date}</div>
                      )}
                    </div>
                  )}
                  <div className="border-b border-gray-50 pb-2">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Terdaftar Sejak</div>
                    <div className="font-medium text-gray-900">{domainInfo.creation_date || 'N/A'}</div>
                  </div>
                  {domainInfo.expiry_date && domainInfo.expiry_date !== 'Unknown' && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Berlaku Hingga</div>
                      <div className="font-medium text-gray-900">{domainInfo.expiry_date}</div>
                    </div>
                  )}
                  <div className="border-b border-gray-50 pb-2">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Umur Domain</div>
                    {domainInfo.age_days !== null && domainInfo.age_days !== undefined ? (
                      <div className={`font-bold text-base ${domainInfo.age_days < 30 ? 'text-red-600' : domainInfo.age_days < 180 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {domainInfo.age_days} hari
                        <span className="text-xs font-normal text-gray-400 ml-1.5">
                          ({domainInfo.age_days < 30
                            ? `${domainInfo.age_days} hari — ⚠️ Sangat Baru`
                            : domainInfo.age_days < 365
                            ? `${Math.floor(domainInfo.age_days / 30)} bulan`
                            : `${(domainInfo.age_days / 365).toFixed(1)} tahun`
                          })
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500">Tidak tersedia</div>
                    )}
                  </div>
                  {domainInfo.nameservers && domainInfo.nameservers.length > 0 && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-1.5">Nameserver</div>
                      <div className="space-y-1">
                        {domainInfo.nameservers.map((ns: string, i: number) => (
                          <div key={i} className="text-xs font-mono text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg print:bg-gray-100">{ns}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {domainInfo.mx_records !== undefined && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-1.5">MX Record (Email Server)</div>
                      {domainInfo.mx_records && domainInfo.mx_records.length > 0 ? (
                        <div className="space-y-1">
                          {domainInfo.mx_records.slice(0, 3).map((mx: string, i: number) => (
                            <div key={i} className="text-xs font-mono text-gray-700 bg-blue-50 px-2.5 py-1 rounded-lg">{mx}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Tidak ada MX record</div>
                      )}
                    </div>
                  )}
                  {domainInfo.urlscan_total !== undefined && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">URLScan.io Threat Intel</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          domainInfo.urlscan_malicious > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {domainInfo.urlscan_malicious > 0 ? `⚠️ ${domainInfo.urlscan_malicious} Malicious` : '✅ Bersih'}
                        </span>
                        <span className="text-xs text-gray-500">{domainInfo.urlscan_total} scan riwayat</span>
                      </div>
                      {domainInfo.urlscan_last_scan && (
                        <div className="text-[10px] text-gray-400 mt-0.5">Scan terakhir: {domainInfo.urlscan_last_scan?.slice(0, 10)}</div>
                      )}
                    </div>
                  )}
                  {domainInfo.page_title && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Judul Halaman</div>
                      <div className="font-medium text-gray-900 text-xs leading-snug">{domainInfo.page_title}</div>
                      {domainInfo.meta_description && (
                        <div className="text-[10px] text-gray-500 mt-1 italic line-clamp-2">{domainInfo.meta_description}</div>
                      )}
                    </div>
                  )}
                  {/* --- Email Auth Row --- */}
                  <div className="border-b border-gray-50 pb-2">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-1.5">Email Authentication</div>
                    <div className="flex flex-wrap gap-2">
                      {domainInfo.spf_record !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          domainInfo.spf_record === 'Tidak Ada' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>SPF {domainInfo.spf_record === 'Tidak Ada' ? '✗ Tidak Ada' : '✓'}</span>
                      )}
                      {domainInfo.dmarc_record !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          domainInfo.dmarc_record === 'Tidak Ada' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>DMARC {domainInfo.dmarc_record === 'Tidak Ada' ? '✗ Tidak Ada' : '✓'}</span>
                      )}
                    </div>
                  </div>
                  {/* --- TLD Risk + DNS TTL Row --- */}
                  {domainInfo.tld_risk && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Risiko TLD</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        domainInfo.tld_risk === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{domainInfo.tld_risk}</span>
                    </div>
                  )}
                  {domainInfo.dns_ttl !== undefined && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">DNS TTL (Fast-Flux)</div>
                      <span className={`font-bold text-sm ${
                        domainInfo.dns_ttl < 300 ? 'text-red-600' : 'text-green-700'
                      }`}>{domainInfo.dns_ttl}s {domainInfo.dns_ttl < 300 ? '⚠️ Sangat Rendah' : '✓ Normal'}</span>
                    </div>
                  )}
                  {/* --- crt.sh + Wayback Row --- */}
                  {domainInfo.cert_count !== undefined && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Certificate Transparency</div>
                      <div className="text-xs text-gray-700 font-medium">{domainInfo.cert_count} sertifikat tercatat di crt.sh</div>
                    </div>
                  )}
                  {domainInfo.wayback_first_seen && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Wayback Machine (Pertama Terlihat)</div>
                      <div className={`text-xs font-medium ${
                        domainInfo.wayback_first_seen === 'Tidak ditemukan' ? 'text-red-500' : 'text-gray-700'
                      }`}>{domainInfo.wayback_first_seen}</div>
                    </div>
                  )}
                  {/* --- Geolocation Row --- */}
                  {domainInfo.geo_country && (
                    <div className="border-b border-gray-50 pb-2">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-0.5">Lokasi Server</div>
                      <div className="font-medium text-gray-900 text-xs">{domainInfo.geo_city}, {domainInfo.geo_country}</div>
                      <div className="text-[10px] text-gray-500">{domainInfo.geo_isp}{domainInfo.geo_as ? ` • ${domainInfo.geo_as}` : ''}</div>
                      {domainInfo.geo_hosting && (
                        <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">Datacenter/Hosting</span>
                      )}
                    </div>
                  )}
                  {/* --- Page Behavior Signals --- */}
                  {(domainInfo.iframe_count !== undefined || domainInfo.external_links_count !== undefined) && (
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold tracking-wide mb-1.5">Sinyal Perilaku Halaman</div>
                      <div className="flex flex-wrap gap-2">
                        {domainInfo.hidden_iframe_count > 0 && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🚫 {domainInfo.hidden_iframe_count} iFrame Tersembunyi</span>
                        )}
                        {domainInfo.iframe_count > 0 && domainInfo.hidden_iframe_count === 0 && (
                          <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{domainInfo.iframe_count} iFrame</span>
                        )}
                        {domainInfo.external_links_count !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            domainInfo.external_links_count > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                          }`}>{domainInfo.external_links_count} Link Eksternal</span>
                        )}
                        {domainInfo.form_actions && domainInfo.form_actions.length > 0 && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Form Kirim ke Luar</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Framework Box */}
            {frameworks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print:border-gray-300 print:shadow-none">
                <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><Server className="w-4 h-4 text-primary-500" /> Teknologi & Stack</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {frameworks.map((fw: string, idx: number) => {
                    const colonIdx = fw.indexOf(': ');
                    const label = colonIdx > -1 ? fw.substring(0, colonIdx) : fw;
                    const value = colonIdx > -1 ? fw.substring(colonIdx + 2) : '';
                    const isWarning = label.toLowerCase().includes('peringatan') || fw.toLowerCase().includes('peringatan');
                    
                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                    if (label.includes('Web Server')) badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
                    else if (label.includes('CDN')) badgeColor = 'bg-orange-50 text-orange-700 border-orange-100';
                    else if (label.includes('Backend') || label.includes('PHP') || label.includes('Python')) badgeColor = 'bg-purple-50 text-purple-700 border-purple-100';
                    else if (label.includes('CMS')) badgeColor = 'bg-teal-50 text-teal-700 border-teal-100';
                    else if (label.includes('Analytics')) badgeColor = 'bg-green-50 text-green-700 border-green-100';
                    else if (label.includes('Security') || label.includes('PERINGATAN')) badgeColor = 'bg-red-50 text-red-700 border-red-100';
                    else if (label.includes('CSS') || label.includes('Library')) badgeColor = 'bg-pink-50 text-pink-700 border-pink-100';

                    return (
                      <div key={idx} className={`flex flex-col p-2.5 rounded-lg border ${badgeColor} ${isWarning ? 'ring-1 ring-red-400' : ''}`}>
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-80 mb-1">{label}</span>
                        <span className={`text-xs font-semibold ${isWarning ? 'text-red-700' : 'text-gray-900'} leading-tight`}>{value || 'Terdeteksi'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Redirect Chain */}
          {redirectChain.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print:border-gray-300 print:shadow-none print:break-inside-avoid">
              <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary-500" /> Jejak Redirect (Redirect Chain)</h3>
              <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-200">
                {redirectChain.map((url: string, idx: number) => (
                  <div key={idx} className="relative flex items-center gap-3">
                    <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-white print:ring-0"></div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex-1 break-all text-xs text-gray-700 font-mono print:bg-white print:border-gray-300">
                      {url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshot / Visual Evidence */}
          {isLink && screenshotUrl && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:border-gray-300 print:shadow-none print:break-inside-avoid">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary-500 shrink-0" />
                <h3 className="font-bold text-gray-900 text-sm">Bukti Visual (Tangkapan Layar)</h3>
                <span className="ml-auto text-[10px] text-gray-500 bg-gray-100 font-medium rounded-md px-2.5 py-1 hidden sm:block">
                  Diambil saat analisis
                </span>
              </div>
              <div className="p-5 sm:p-6 bg-gray-50/50 flex justify-center">
                <div className="w-full max-w-4xl rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  {/* Mock Browser Top Bar */}
                  <div className="h-8 border-b border-gray-100 bg-gray-50/80 flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    <div className="mx-auto flex-1 flex justify-center px-8">
                      <div className="bg-white border border-gray-200 rounded text-[10px] text-gray-400 px-3 py-0.5 max-w-[200px] w-full truncate text-center">
                        {scan.target_url}
                      </div>
                    </div>
                  </div>
                  {/* Image Container */}
                  <div className="bg-white">
                    <ScreenshotImage src={screenshotUrl} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Log Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:border-gray-300 print:shadow-none">
            <div className="p-5 sm:p-6 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">Log Audit Keamanan</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {details.length > 0 ? (
                <ul className="space-y-4">
                  {details.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0 print:border-gray-200">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 print:bg-white print:border print:border-gray-300 print:text-black">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.step}</div>
                        <div className="text-sm text-gray-600 mt-1 leading-relaxed print:text-black">{item.finding}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada detail langkah analisis yang tersedia.</p>
              )}

              {extractedCode && (
                <div className="mt-6 print:mt-8">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 print:text-black" /> Cuplikan Kode / Anotasi Ekstraksi
                  </h3>
                  {/* Tailwind print classes for code block: white bg, black text, wrap text so it doesn't overflow paper */}
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs sm:text-sm text-green-400 font-mono print:bg-white print:border print:border-gray-300 print:text-black print:whitespace-pre-wrap print:overflow-hidden print:break-inside-avoid">
                    <pre className="print:whitespace-pre-wrap"><code>{extractedCode}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
            <Link href="/scan" className="flex-1 bg-white text-gray-700 border border-gray-200 font-semibold py-3 px-5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
              <RefreshCw className="w-4 h-4" /> Scan Ulang Target Lain
            </Link>
          </div>
        </div>

        {/* Right Column: Sidebar - Hidden on Print */}
        <div className="space-y-4 sm:space-y-6 print:hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Informasi Metadata</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                <span className="text-gray-500 shrink-0">Waktu Scan</span>
                <span className="font-medium text-right text-gray-900">{new Date(scan.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                <span className="text-gray-500 shrink-0">Tipe Entitas</span>
                <span className="font-medium text-right text-gray-900">{scan.target_type}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                <span className="text-gray-500 shrink-0">Status Sistem</span>
                <span className="font-medium text-right text-green-600">Terverifikasi</span>
              </div>
              <div className="flex justify-between gap-2 pt-1">
                <span className="text-gray-500 shrink-0">ID Laporan</span>
                <span className="font-mono text-xs text-right text-gray-500">{scan.id.split('-')[0]}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Penafian Laporan</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Laporan ini dibuat otomatis menggunakan teknik <i>static & dynamic analysis</i> tanpa manipulasi.
              Sistem PhishDeep tidak bertanggung jawab atas kerugian yang ditimbulkan akibat salah tafsir terhadap data ini.
            </p>
          </div>
        </div>
        
        {/* Footer for Print Only */}
        <div className="hidden print:block print:w-full mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          Laporan dibuat secara otomatis oleh sistem PhishDeep Security. Dokumen ini sah dan dapat digunakan sebagai referensi audit.
        </div>
      </div>
    </div>
  );
}
