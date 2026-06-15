import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function CaraKerjaPage() {
  const steps = [
    {
      step: "01",
      title: "Masukkan Target",
      desc: "Tempelkan URL mencurigakan, atau unggah file APK yang ingin Anda periksa ke form pemindaian PhishDeep."
    },
    {
      step: "02",
      title: "Analisis Otomatis di Sandbox",
      desc: "Sistem kami membuka target di lingkungan virtual yang terisolasi (sandbox). Tidak ada risiko bagi perangkat Anda. Kami menganalisis perilaku halaman, redirect, sertifikat SSL, metadata file, dan permission APK."
    },
    {
      step: "03",
      title: "Deteksi & Anotasi Visual",
      desc: "Algoritma kami mencocokkan ratusan pola penipuan. Jika ditemukan ancaman, sistem akan menandai area berbahaya dengan kotak merah dan keterangan di atas screenshot."
    },
    {
      step: "04",
      title: "Laporan Forensik Siap Unduh",
      desc: "Anda mendapatkan laporan lengkap: screenshot beranotasi, redirect chain, skor risiko, dan file PDF yang bisa langsung digunakan sebagai bukti untuk laporan ke pihak berwajib."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-10 pb-10 bg-gradient-to-b from-blue-50 to-white dark:from-transparent dark:to-transparent">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="mb-4">
              <BackButton />
            </div>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-primary-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm mx-auto">
              <ShieldCheck className="w-4 h-4 shrink-0" /> <span className="leading-tight">Cara Kerja</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">Bagaimana PhishDeep Melindungi Anda</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">Proses pemindaian berjalan sepenuhnya otomatis di server kami. Anda hanya perlu mengirimkan target, dan kami yang melakukan sisanya.</p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 bg-white dark:bg-transparent">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-12">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-primary-600/20">
                    {s.step}
                  </div>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{s.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 bg-gray-50 dark:bg-transparent">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Kenapa PhishDeep Lebih Baik?</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <th className="p-3 sm:p-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base w-1/2">Fitur</th>
                    <th className="p-3 sm:p-6 font-semibold text-gray-900 dark:text-white text-center text-sm sm:text-base w-1/4">Tools Lain</th>
                    <th className="p-3 sm:p-6 font-bold text-primary-600 text-center text-sm sm:text-base w-1/4 bg-blue-50 dark:bg-blue-500/20/50">PhishDeep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Deteksi phishing / malware</td>
                    <td className="p-3 sm:p-6 text-center text-gray-400 dark:text-gray-500 text-base sm:text-lg">✓</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Screenshot bukti visual</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Kotak merah area scam</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Redirect chain lengkap</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Laporan PDF forensik</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Bukti siap laporan polisi</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 font-bold bg-blue-50 dark:bg-blue-500/20/20 text-base sm:text-lg">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Gratis Digunakan</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Privasi Terjaga</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> File Auto-Delete 24 Jam</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Aman & Terpercaya</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 bg-primary-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Coba Sekarang</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto text-sm sm:text-base">Scan link pertama Anda dan lihat sendiri perbedaannya.</p>
            <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-950 text-primary-900 dark:text-white font-semibold px-8 py-4 rounded-xl border border-transparent dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 group">
              Mulai Scan Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
