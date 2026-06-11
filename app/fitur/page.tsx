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
      color: "bg-blue-100 text-primary-600"
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: "Scan APK Android",
      desc: "Unggah file APK dan kami akan mengekstrak daftar permission, mendeteksi overlay attack, dan mencocokkan signature malware. Hasilnya ditampilkan dengan visual highlight pada izin berbahaya.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <FileSearch className="w-7 h-7" />,
      title: "Scan Dokumen (PDF / Office)",
      desc: "Dokumen sering disusupi embedded URL dan macro berbahaya. PhishDeep mengekstrak dan menganalisis setiap link tersembunyi di dalam file Anda tanpa membuka file di perangkat Anda.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Laporan Bukti Forensik (PDF)",
      desc: "Setiap hasil scan menghasilkan laporan PDF profesional yang mencakup screenshot, anotasi, redirect chain, dan analisis risiko — siap digunakan sebagai bukti untuk laporan resmi ke pihak berwajib.",
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-10 pb-10 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="mb-4">
              <BackButton />
            </div>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-primary-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm mx-auto">
              <ShieldCheck className="w-4 h-4 shrink-0" /> <span className="leading-tight">Fitur Lengkap</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">Semua yang Anda Butuhkan untuk Keamanan Digital</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">PhishDeep menyediakan empat jenis pemindaian untuk melindungi Anda dari berbagai ancaman siber, lengkap dengan bukti visual.</p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 p-6 sm:p-10 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${f.color} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
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
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 group">
              Mulai Scan Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
