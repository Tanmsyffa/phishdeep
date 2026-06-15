import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function CaraKerjaPage() {
  const steps = [
    {
      step: "01",
      title: "Masukkan Target",
      desc: "Tempelkan URL mencurigakan, atau unggah file APK yang ingin Anda periksa ke form pemindaian PhishDeep.",
      color: "bg-blue-500"
    },
    {
      step: "02",
      title: "Analisis Otomatis di Sandbox",
      desc: "Sistem kami membuka target di lingkungan virtual yang terisolasi (sandbox). Tidak ada risiko bagi perangkat Anda. Kami menganalisis perilaku halaman, redirect, sertifikat SSL, metadata file, dan permission APK.",
      color: "bg-purple-500"
    },
    {
      step: "03",
      title: "Deteksi & Anotasi Visual",
      desc: "Algoritma kami mencocokkan ratusan pola penipuan. Jika ditemukan ancaman, sistem akan menandai area berbahaya dengan kotak merah dan keterangan di atas screenshot.",
      color: "bg-orange-500"
    },
    {
      step: "04",
      title: "Laporan Forensik Siap Unduh",
      desc: "Anda mendapatkan laporan lengkap: screenshot beranotasi, redirect chain, skor risiko, dan file PDF yang bisa langsung digunakan sebagai bukti untuk laporan ke pihak berwajib.",
      color: "bg-green-500"
    }
  ];

  const tableRows = [
    { feature: "Deteksi phishing / malware", other: true, us: true },
    { feature: "Screenshot bukti visual", other: false, us: true },
    { feature: "Kotak merah area scam", other: false, us: true },
    { feature: "Redirect chain lengkap", other: false, us: true },
    { feature: "Laporan PDF forensik", other: false, us: true },
    { feature: "Bukti siap laporan polisi", other: false, us: true },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">

        {/* Hero */}
        <section className="pt-8 pb-14 border-b border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Cara Kerja
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight max-w-3xl">
                Bagaimana PhishDeep <span className="text-primary-600">Melindungi Anda</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                Proses pemindaian berjalan sepenuhnya otomatis di server kami. Anda hanya perlu mengirimkan target, dan kami yang melakukan sisanya.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 hidden sm:block" />
              <div className="space-y-10">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-5 sm:gap-7 items-start relative">
                    <div className={`shrink-0 w-11 h-11 ${s.color} text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md z-10`}>
                      {s.step}
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex-1 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 border-t border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Kenapa PhishDeep Lebih Baik?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Tidak hanya mendeteksi — kami memberikan <strong className="text-gray-700 dark:text-gray-200">bukti nyata</strong> yang bisa digunakan.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800">
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-sm w-1/2">Fitur</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-center text-sm w-1/4">Tools Lain</th>
                    <th className="px-6 py-4 font-bold text-primary-600 dark:text-primary-400 text-center text-sm w-1/4 bg-blue-50/50 dark:bg-blue-500/10">PhishDeep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {tableRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 text-sm">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center text-base">
                        {row.other ? <span className="text-gray-400 dark:text-gray-500">✓</span> : <span className="text-red-400">✕</span>}
                      </td>
                      <td className="px-6 py-3.5 text-center text-green-600 dark:text-green-400 font-bold text-base bg-blue-50/30 dark:bg-blue-500/5">✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gratis Digunakan</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Privasi Terjaga</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> File Auto-Delete 24 Jam</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Aman & Terpercaya</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-slate-900 to-primary-950 dark:from-slate-950 dark:to-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold mb-6">
              <ShieldAlert className="w-3.5 h-3.5" /> Mulai Gratis, Tanpa Kartu Kredit
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Coba Sekarang</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">Scan link pertama Anda dan lihat sendiri perbedaannya. Tidak perlu kartu kredit.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
                Mulai Scan Gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/fitur" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-base">
                Lihat Fitur Lengkap
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
