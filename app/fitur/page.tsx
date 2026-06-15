import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Link as LinkIcon, Smartphone, FileSearch, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function FiturPage() {
  const features = [
    {
      icon: <LinkIcon className="w-7 h-7" />,
      title: "Scan Link / URL",
      desc: "Tempelkan link mencurigakan dan PhishDeep akan membuka halaman tersebut di browser virtual yang aman. Kami mengambil screenshot, menelusuri redirect chain, dan menganalisis sertifikat SSL untuk mendeteksi phishing.",
      color: "bg-blue-100 dark:bg-blue-500/40 text-primary-600"
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: "Scan APK Android",
      desc: "Unggah file APK dan kami akan mengekstrak daftar permission, mendeteksi overlay attack, dan mencocokkan signature malware. Hasilnya ditampilkan dengan visual highlight pada izin berbahaya.",
      color: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
    },

    {
      icon: <FileText className="w-7 h-7" />,
      title: "Laporan Bukti Forensik (PDF)",
      desc: "Setiap hasil scan menghasilkan laporan PDF profesional yang mencakup screenshot, anotasi, redirect chain, dan analisis risiko — siap digunakan sebagai bukti untuk laporan resmi ke pihak berwajib.",
      color: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
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
              <ShieldCheck className="w-4 h-4 shrink-0" /> <span className="leading-tight">Fitur Lengkap</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">Semua yang Anda Butuhkan untuk Keamanan Digital</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">PhishDeep menyediakan tiga fitur utama untuk melindungi Anda dari berbagai ancaman siber, lengkap dengan bukti visual.</p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 bg-white dark:bg-transparent">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 sm:p-10 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${f.color} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 bg-primary-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Siap Mencoba?</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">Mulai scan pertama Anda sekarang. Gratis, tanpa perlu kartu kredit.</p>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-950 text-primary-900 dark:text-white font-semibold px-8 py-4 rounded-xl border border-transparent dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 group">
              Mulai Scan Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
