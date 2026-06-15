import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Link as LinkIcon, Smartphone, FileText, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function FiturPage() {
  const features = [
    {
      icon: <LinkIcon className="w-7 h-7" />,
      title: "Scan Link / URL",
      desc: "Tempelkan link mencurigakan dan PhishDeep akan membuka halaman tersebut di browser virtual yang aman. Kami mengambil screenshot, menelusuri redirect chain, dan menganalisis sertifikat SSL untuk mendeteksi phishing.",
      color: "bg-blue-100 dark:bg-blue-500/20 text-primary-600",
      badge: "URL & Link",
      badgeColor: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: "Scan APK Android",
      desc: "Unggah file APK dan kami akan mengekstrak daftar permission, mendeteksi overlay attack, dan mencocokkan signature malware. Hasilnya ditampilkan dengan visual highlight pada izin berbahaya.",
      color: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
      badge: "Android APK",
      badgeColor: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800"
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Laporan Bukti Forensik (PDF)",
      desc: "Setiap hasil scan menghasilkan laporan PDF profesional yang mencakup screenshot, anotasi, redirect chain, dan analisis risiko — siap digunakan sebagai bukti untuk laporan resmi ke pihak berwajib.",
      color: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
      badge: "PDF Report",
      badgeColor: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800"
    }
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
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Fitur Lengkap
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight max-w-3xl">
                Semua yang Anda Butuhkan untuk <span className="text-primary-600">Keamanan Digital</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                PhishDeep menyediakan tiga fitur utama untuk melindungi Anda dari berbagai ancaman siber, lengkap dengan bukti visual yang siap digunakan.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-16 bg-transparent">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-7 rounded-2xl hover:shadow-xl dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      {f.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${f.badgeColor}`}>{f.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm flex-grow">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-10">
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap Melindungi Diri Anda?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">Mulai scan pertama Anda sekarang. Deteksi phishing dan malware dengan bukti visual yang nyata.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
                Mulai Scan Gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/cara-kerja" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-base">
                Pelajari Cara Kerja
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
