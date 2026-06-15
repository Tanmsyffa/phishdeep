import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import Link from "next/link";
import { ShieldCheck, Target, Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
  const supabase = createClient();

  // Gunakan RPC (Remote Procedure Call) agar bisa membypass RLS (Row Level Security)
  const { data: rpcData, error } = await supabase.rpc("get_public_stats");

  let totalScans = 0;
  let totalThreats = 0;

  if (rpcData && rpcData.length > 0) {
    totalScans = rpcData[0].total_scans;
    totalThreats = rpcData[0].total_threats;
  }

  // Format numbers (e.g., 1500 -> 1.5K, 500 -> 500+)
  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return `${num}+`;
  };

  const cards = [
    {
      icon: <Target className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-blue-100 dark:bg-blue-500/20 text-primary-600 dark:text-blue-400",
      title: "Misi Kami",
      desc: "Memberantas penipuan digital dengan menyediakan alat deteksi yang mudah digunakan, akurat, dan dapat memberikan bukti visual untuk orang awam maupun profesional."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
      title: "Visi Kami",
      desc: "Menjadi platform verifikasi keamanan siber terdepan di Indonesia yang dipercaya oleh individu, UMKM, instansi pendidikan, hingga perusahaan besar."
    },
    {
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
      title: "Tim Kami",
      desc: "Terdiri dari para penggiat keamanan siber, pengembang perangkat lunak, dan analis malware yang peduli terhadap tingginya angka penipuan online."
    }
  ];

  const stats = [
    { value: formatNumber(totalScans), label: "Total Scan Dilakukan" },
    { value: formatNumber(totalThreats), label: "Ancaman Terdeteksi" },
    { value: "24/7", label: "Layanan Aktif" },
    { value: "100%", label: "Gratis" },
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
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Tentang Kami
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight max-w-3xl">
                Tentang <span className="text-primary-600">PhishDeep</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                Kami berdedikasi untuk menciptakan ruang digital yang lebih aman bagi seluruh masyarakat Indonesia dengan memberikan bukti forensik, bukan sekadar peringatan.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 border-b border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center py-5 px-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                  <div className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 mb-1">{s.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Apa yang Kami Percaya</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Nilai-nilai yang mendasari setiap fitur dan keputusan yang kami buat.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {cards.map((c, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-7 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center mb-5`}>
                    {c.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{c.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-to-br from-slate-900 to-primary-950 dark:from-slate-950 dark:to-slate-900 text-white rounded-3xl p-10 sm:p-14 text-center border border-primary-800/20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Bersama Membangun Internet yang Aman</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                Setiap harinya ribuan URL phishing baru bermunculan. Dengan menggunakan PhishDeep, Anda turut berkontribusi dalam memetakan dan menghentikan pergerakan pelaku kejahatan siber.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:-translate-y-0.5 group">
                  Mulai Gratis Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/cara-kerja" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300">
                  Cara Kerja
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
