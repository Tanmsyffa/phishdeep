"use client";

import { useState, useEffect } from "react";
import { LinkIcon, Smartphone, FileSearch, Image as ImageIcon, ShieldAlert, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { checkScanLimit, saveScanResult } from "./actions";
import { createClient } from "@/lib/supabase/client";

export default function NewScanPage() {
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
  }, []);

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
        const { data: { publicUrl } } = supabase.storage.from('scans').getPublicUrl(filePath);
        targetUrl = publicUrl; // Python will analyze this URL
      }

      setScanStatusMsg("Menjalankan Analisis Forensik Asli...");
      
      let scanResult;
      // Try calling Vercel Python Function
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetUrl, type: activeTab })
      });
      if (!res.ok) {
        let errorTxt = "Target tidak dapat dijangkau atau analisis terhenti.";
        try {
           const errData = await res.json();
           if (errData.message) errorTxt = errData.message;
        } catch(e) {}
        throw new Error(errorTxt);
      }
      scanResult = await res.json();

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
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Scan Baru</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Pilih jenis file atau masukkan link yang ingin di-scan</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'link' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <LinkIcon className="w-4 h-4 shrink-0" /> Link
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('apk')}
                className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'apk' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" /> APK
              </button>
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">URL Target</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="contoh-link.com atau https://contoh.com" 
                      className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:bg-gray-100 dark:disabled:bg-slate-900 text-gray-900 dark:text-white"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScanning}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isScanning}
                      className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                      Scan Sekarang
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleScan} className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 sm:p-12 text-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    onChange={handleFileChange}
                    disabled={isScanning}
                    required
                  />
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{file ? file.name : 'Upload File Anda'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">{file ? 'File siap untuk dipindai (Maks 25MB)' : 'Tarik dan letakkan file di sini atau klik (Maks 25MB)'}</p>
                  <button type="submit" disabled={isScanning || !file} className="text-white font-medium text-sm border bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 relative z-10 cursor-pointer">
                    {file ? 'Mulai Scan' : 'Pilih File'}
                  </button>
                </form>
              )}
            </div>
            
            {!isScanning && limitCheck.allowed && activeTab === 'link' && (
              <div className="px-4 sm:px-8 pb-5 sm:pb-8">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
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
            <div className="bg-blue-50 dark:bg-blue-500/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Analisis Nyata</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Analisis file/URL <strong>secara langsung</strong>, bukan simulasi. Maks. <strong>25MB</strong>. File dihapus setelah analisis.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Tips Aman</h3>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span> Jangan masukkan data pribadi di situs mencurigakan.</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span> PhishDeep tidak menyimpan file Anda secara permanen.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
