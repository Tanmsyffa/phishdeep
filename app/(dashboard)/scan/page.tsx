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
        throw new Error("Target tidak dapat dijangkau atau analisis terhenti.");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream tidak tersedia.");
      
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          try {
            const parsed = JSON.parse(line);
            if (parsed.status === "progress") {
              setScanStatusMsg(parsed.message);
            } else if (parsed.status === "success") {
              scanResult = parsed.result;
            } else if (parsed.status === "error") {
              throw new Error(parsed.message);
            }
          } catch (e: any) {
             if (e.message !== "Unexpected end of JSON input" && e.message !== "Unexpected token") {
                console.error("JSON Parse error:", e);
             }
          }
        }
        buffer = lines[lines.length - 1];
      }
      
      if (!scanResult) throw new Error("Gagal mendapatkan hasil dari server.");

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
        setErrorMsg("Analisis terhenti: Server forensik sedang sibuk atau target tidak dapat dijangkau. Silakan coba lagi nanti.");
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Scan Baru</h1>
        <p className="text-sm text-gray-500">Pilih jenis file atau masukkan link yang ingin di-scan</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button 
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 sm:px-6 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap min-w-0
                ${activeTab === 'link' ? 'text-primary-600 border-b-2 border-primary-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('link')}
              >
                <LinkIcon className="w-4 h-4 shrink-0" /> Link
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 sm:px-6 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap min-w-0
                ${activeTab === 'apk' ? 'text-primary-600 border-b-2 border-primary-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('apk')}
              >
                <Smartphone className="w-4 h-4 shrink-0" /> APK
              </button>
            </div>

            <div className="p-4 sm:p-8">
              {limitCheck.loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Memeriksa kuota...</p>
                </div>
              ) : !limitCheck.allowed ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <h3 className="font-bold text-lg mb-1">Batas Scan Tercapai</h3>
                  <p className="text-sm">Anda telah mencapai batas 10 scan untuk hari ini. Silakan kembali besok.</p>
                </div>
              ) : isScanning ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-1">{scanStatusMsg}</h3>
                  <p className="text-sm text-gray-500">Mengeksekusi analisis, harap tunggu. File yang diunggah akan segera dihapus setelah analisis selesai.</p>
                </div>
              ) : activeTab === 'link' ? (
                <form onSubmit={handleScan}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan URL</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="contoh-link.com atau https://contoh.com" 
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow disabled:bg-gray-100"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScanning}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isScanning}
                      className="w-full sm:w-auto bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                      Scan Sekarang
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleScan} className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    onChange={handleFileChange}
                    disabled={isScanning}
                    required
                  />
                  <div className="w-16 h-16 bg-blue-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'apk' && <Smartphone className="w-8 h-8" />}
                    {activeTab === 'image' && <ImageIcon className="w-8 h-8" />}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{file ? file.name : 'Upload File Anda'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{file ? 'File siap untuk dipindai (Maks 25MB)' : 'Tarik dan letakkan file di sini atau klik (Maks 25MB)'}</p>
                  <button type="submit" disabled={isScanning || !file} className="text-white font-medium text-sm border bg-primary-600 px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 relative z-10 cursor-pointer">
                    {file ? 'Mulai Scan' : 'Pilih File'}
                  </button>
                </form>
              )}
            </div>
            
            {!isScanning && limitCheck.allowed && activeTab === 'link' && (
              <div className="px-4 sm:px-8 pb-5 sm:pb-8">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-2.5">Contoh link phishing untuk dicoba:</h4>
                  <ul className="space-y-1.5 text-xs text-primary-600">
                    <li><button onClick={() => setUrl('bca-security-update-verify.com/login')} className="hover:underline text-left text-blue-600 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-600 shrink-0"></span><span className="break-all">bca-security-update-verify.com/login</span></button></li>
                    <li><button onClick={() => setUrl('secure.login.paypal.com.account-refund.info')} className="hover:underline text-left text-blue-600 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-600 shrink-0"></span><span className="break-all">secure.login.paypal.com.account-refund.info</span></button></li>
                    <li><button onClick={() => setUrl('google.com@scammer-site.net/login')} className="hover:underline text-left text-blue-600 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span><span className="break-all">google.com@scammer-site.net/login</span></button></li>
                    <li><button onClick={() => setUrl('xn--bca-6y3a.com')} className="hover:underline text-left text-blue-600 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span><span>xn--bca-6y3a.com (Homograph/IDN)</span></button></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Info cards - visible on all screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Analisis Nyata</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Analisis file/URL <strong>secara langsung</strong>, bukan simulasi. Maks. <strong>25MB</strong>. File dihapus setelah analisis.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Tips Aman</h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
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
