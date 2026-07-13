"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LinkIcon, Smartphone, ShieldAlert, Loader2 } from "lucide-react";
import { checkScanLimit, saveScanResult } from "./actions";
import { createClient } from "@/lib/supabase/client";

function ScanForm() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("link");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [limitCheck, setLimitCheck] = useState({ allowed: true, count: 0, loading: true });
  const [scanStatusMsg, setScanStatusMsg] = useState("Sedang Menganalisis...");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkScanLimit().then(res => setLimitCheck({ ...res, loading: false }));
    // Pre-fill from Re-Scan navigation
    const rescanUrl = searchParams.get('rescan');
    const rescanType = searchParams.get('type');
    if (rescanUrl) {
      setUrl(decodeURIComponent(rescanUrl));
      if (rescanType) setActiveTab(rescanType.toLowerCase() === 'apk' ? 'apk' : 'link');
    }
  }, [searchParams]);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (activeTab === 'link' && !url) return;
    if (activeTab !== 'link' && !file) return;
    
    setIsScanning(true);
    let targetUrl = activeTab === 'link' ? url.trim() : file!.name;
    
    // Auto-prepend http:// if missing for links
    if (activeTab === 'link' && targetUrl && !/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }

    const type = activeTab === 'link' ? 'Link' : 'APK';
    
    let uploadedFilePath = "";

    try {
      // 1. Verifikasi Limit sebelum memakan resource backend
      setScanStatusMsg("Memverifikasi kuota scan...");
      const freshLimit = await checkScanLimit();
      if (!freshLimit.allowed) {
        throw new Error("Batas scan harian (10) telah tercapai. Silakan coba lagi besok.");
      }

      if (activeTab !== 'link' && file) {
        setScanStatusMsg("Mengunggah file ke Storage sementara (Enkripsi)...");
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('scans')
          .upload(filePath, file);
          
        if (uploadError) throw new Error("Gagal mengunggah file");
        
        uploadedFilePath = filePath;
        const { data: signedData, error: signedError } = await supabase.storage.from('scans').createSignedUrl(filePath, 300);
        if (signedError || !signedData?.signedUrl) throw new Error("Gagal membuat URL aman sementara untuk analisis");
        targetUrl = signedData.signedUrl;
      }

      setScanStatusMsg("Menjalankan Analisis Forensik Asli...");
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

      // Try calling Vercel Python Function
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetUrl, type: activeTab, baseUrl })
      });
      if (!res.ok) {
        let errorTxt = "Target tidak dapat dijangkau atau analisis terhenti.";
        try {
           const errData = await res.json();
           if (errData.message) errorTxt = errData.message;
        } catch {}
        throw new Error(errorTxt);
      }
      const scanResult = await res.json();

      setScanStatusMsg("Menyimpan hasil laporan...");
      
      // Save to Supabase DB (using the original filename, not the long supabase URL)
      const displayTarget = activeTab === 'link' ? url : file!.name;
      const savedData = await saveScanResult(displayTarget, type, scanResult, scanResult.risk_score);
      
      router.push(`/scan/${savedData.id}`);
    } catch (err: any) {
      // Menampilkan pesan spesifik jika itu limit, jika tidak gunakan generic error
      if (err.message && err.message.includes("Batas scan")) {
        setErrorMsg(err.message);
        // Perbarui limit UI agar form disembunyikan
        setLimitCheck({ allowed: false, count: 10, loading: false });
      } else {
        setErrorMsg(err.message || "Analisis terhenti: Server forensik sedang sibuk atau target tidak dapat dijangkau. Silakan coba lagi nanti.");
      }
      setIsScanning(false);
    } finally {
      // Auto-Delete file from storage for privacy
      if (uploadedFilePath) {
        await supabase.storage.from('scans').remove([uploadedFilePath]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrorMsg("Ukuran file melebihi batas 25MB. Silakan pilih file yang lebih kecil.");
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:-/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Scan Baru</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pilih jenis file atau masukkan link target</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="bg-ios-card/80 dark:bg-white/10 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-xl">
            {/* iOS Segmented Control Tab */}
            <div className="p-4 sm:p-6 pb-0">
              <div className="flex bg-gray-100/80 dark:bg-white/5 rounded-full p-1 border border-gray-200/50 dark:border-white/10 relative">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-full transition-all duration-300 relative z-10 ${
                    activeTab === 'link' 
                    ? 'text-gray-900 dark:text-white shadow-sm bg-white dark:bg-ios-cardDark border border-gray-200/50 dark:border-white/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 shrink-0" /> Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apk')}
                  className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-full transition-all duration-300 relative z-10 ${
                    activeTab === 'apk' 
                    ? 'text-gray-900 dark:text-white shadow-sm bg-white dark:bg-ios-cardDark border border-gray-200/50 dark:border-white/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" /> APK
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {limitCheck.loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">Memeriksa kuota...</p>
                </div>
              ) : !limitCheck.allowed ? (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-6 text-center">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <h3 className="font-bold text-lg mb-1">Batas Scan Tercapai</h3>
                  <p className="text-sm">Anda telah mencapai batas 10 scan untuk hari ini. Silakan kembali besok.</p>
                </div>
              ) : isScanning ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{scanStatusMsg}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Mengeksekusi analisis, harap tunggu. File yang diunggah akan segera dihapus setelah analisis selesai.</p>
                </div>
              ) : activeTab === 'link' ? (
                <form onSubmit={handleScan}>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 ml-1">URL Target</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="contoh.com atau https://contoh.com" 
                        className="w-full border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScanning}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isScanning || !url.trim()}
                      className="w-full sm:w-auto bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-sm text-sm disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      Scan Sekarang
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleScan} className="border border-dashed border-gray-300 dark:border-white/20 bg-gray-50/50 dark:bg-white/5 rounded-3xl p-8 sm:p-12 text-center hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors cursor-pointer relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20" 
                    onChange={handleFileChange}
                    disabled={isScanning}
                    required
                  />
                  <div className="w-16 h-16 bg-white dark:bg-ios-cardDark rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{file ? file.name : 'Upload File Anda'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{file ? 'File siap dipindai (Maks 25MB)' : 'Tarik file ke sini atau klik (Maks 25MB)'}</p>
                  <button type="submit" disabled={isScanning || !file} className="text-white font-semibold text-sm bg-blue-600 px-8 py-3 rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 relative z-30 cursor-pointer active:scale-95 shadow-sm">
                    {file ? 'Mulai Scan' : 'Pilih File'}
                  </button>
                </form>
              )}
            </div>
            
            {!isScanning && limitCheck.allowed && activeTab === 'link' && (
              <div className="px-4 sm:px-8 pb-5 sm:pb-8">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 dark:border-white/10">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2.5">Contoh link phishing untuk dicoba:</h4>
                  <ul className="space-y-1.5 text-xs text-primary-600">
                    <li><button onClick={() => setUrl('bca-security-update-verify.com/login')} className="hover:underline text-left text-blue-600 dark:text-blue-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-600 shrink-0"></span><span className="break-all">bca-security-update-verify.com/login</span></button></li>
                    <li><button onClick={() => setUrl('secure.login.paypal.com.account-refund.info')} className="hover:underline text-left text-blue-600 dark:text-blue-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-600 shrink-0"></span><span className="break-all">secure.login.paypal.com.account-refund.info</span></button></li>
                    <li><button onClick={() => setUrl('google.com@scammer-site.net/login')} className="hover:underline text-left text-blue-600 dark:text-blue-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span><span className="break-all">google.com@scammer-site.net/login</span></button></li>
                    <li><button onClick={() => setUrl('xn--bca-6y3a.com')} className="hover:underline text-left text-blue-600 dark:text-blue-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span><span>xn--bca-6y3a.com (Homograph/IDN)</span></button></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Info cards - visible on all screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-ios-card/80 dark:bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 bg-blue-50 dark:-/20 rounded-full flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Analisis Nyata</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-11">
                Analisis file/URL <strong>secara langsung</strong>, bukan simulasi. Maks <strong>25MB</strong>.
              </p>
            </div>
            
            <div className="bg-ios-card/80 dark:bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Tips Aman</h3>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center font-bold shrink-0">✓</span> Jangan input data pribadi di situs mencurigakan.</li>
                <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center font-bold shrink-0">✓</span> File akan dihapus otomatis pasca-analisis.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-2" />
        Memuat...
      </div>
    }>
      <ScanForm />
    </Suspense>
  );
}
