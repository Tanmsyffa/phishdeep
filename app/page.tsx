import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Link as LinkIcon, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-ios-bg dark:bg-ios-bgDark pb-20 lg:pb-0">
      <Header />

      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────── */}
        <section className="pt-12 pb-20 overflow-hidden relative">
          {/* Subtle background orb — no neon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[100px] pointer-events-none -z-0" />

          <div className="container mx-auto px-5 max-w-5xl relative z-10">
            <div className="flex flex-col items-center text-center">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 backdrop-blur-sm text-xs font-semibold text-gray-600 dark:text-gray-300 mb-6 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Deteksi Phishing & Malware dengan Bukti Visual
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-5 max-w-3xl">
                Jangan cuma tahu link berbahaya.{" "}
                <span className="text-blue-600 dark:text-blue-400">Lihat bukti nyatanya.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
                PhishDeep mendeteksi phishing, malware, dan ancaman pada link & APK — lengkap dengan bukti visual forensik siap lapor.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
                <Link
                  href="/scan"
                  className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/20 text-sm hover:-translate-y-0.5 group active:scale-95"
                >
                  Scan Gratis Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cara-kerja"
                  className="inline-flex justify-center items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-white/10 px-7 py-3.5 rounded-full font-semibold hover:bg-white dark:hover:bg-white/10 transition-all duration-200 text-sm active:scale-95"
                >
                  Cara Kerja
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                {['Kotak merah di area scam', 'Laporan PDF forensik', 'Gratis & tanpa kartu kredit'].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Mockup */}
            <div className="mt-14 relative max-w-[680px] mx-auto">
              {/* Glow */}
              <div className="absolute inset-0 bg-blue-500/8 dark:bg-blue-500/12 blur-[60px] rounded-3xl pointer-events-none" />

              <div className="relative bg-ios-card dark:bg-ios-cardDark rounded-[28px] border border-gray-200/60 dark:border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Browser chrome */}
                <div className="h-11 bg-gray-50 dark:bg-[#2C2C2E] border-b border-gray-200/50 dark:border-white/5 flex items-center px-4 gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 bg-white/60 dark:bg-black/30 text-[11px] text-gray-600 dark:text-gray-400 font-medium px-3 py-1 rounded-full border border-gray-200/50 dark:border-white/5 flex items-center gap-2 max-w-[300px] mx-auto">
                    <span className="text-red-400">🔓</span> https://secure-bca-update.com/login
                  </div>
                </div>

                {/* Page content mock */}
                <div className="relative h-[300px] sm:h-[360px] bg-gray-100 dark:bg-[#1a1a1a] flex items-start justify-center pt-8 overflow-hidden">
                  {/* Fake bank card */}
                  <div className="w-[260px] sm:w-[300px] bg-white dark:bg-ios-cardDark rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-lg overflow-hidden opacity-75">
                    <div className="bg-blue-600 p-5 text-center">
                      <div className="w-10 h-10 bg-white rounded-full mx-auto mb-2 flex items-center justify-center text-blue-600 font-black text-xl">B</div>
                      <p className="text-white font-bold text-base">Bank Central</p>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="space-y-1"><div className="h-2.5 w-16 bg-gray-200 dark:bg-white/10 rounded" /><div className="h-9 border border-gray-200 dark:border-white/5 rounded-lg bg-gray-50 dark:bg-white/5" /></div>
                      <div className="space-y-1"><div className="h-2.5 w-12 bg-gray-200 dark:bg-white/10 rounded" /><div className="h-9 border border-gray-200 dark:border-white/5 rounded-lg bg-gray-50 dark:bg-white/5" /></div>
                      <div className="h-9 bg-blue-600 rounded-lg mt-2" />
                    </div>
                  </div>

                  {/* Red detection box */}
                  <div className="absolute inset-[16px] sm:inset-[20px] border-2 border-red-500 bg-red-500/8 rounded-xl pointer-events-none">
                    {/* Scan line animation (Composited) */}
                    <div
                      className="absolute left-0 right-0 h-full border-b-2 border-red-500/60"
                      style={{ animation: 'scanLine 2.5s ease-in-out infinite', transform: 'translateY(-100%)' }}
                    />
                    <style dangerouslySetInnerHTML={{__html:`@keyframes scanLine{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(0%);opacity:0}}`}} />
                    {/* Danger label */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                      ⚠ PHISHING TERDETEKSI
                    </div>
                    {/* Corner anchors */}
                    {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((p) => (
                      <div key={p} className={`absolute ${p} w-3 h-3 border-2 border-red-500`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────── */}
        <section id="fitur" className="py-16">
          <div className="container mx-auto px-5 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Fitur Utama PhishDeep</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Tiga alat pemindaian untuk memastikan Anda aman dari segala ancaman siber.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                { icon: <LinkIcon className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/15', title: 'Scan Link', desc: 'Deteksi phishing pada link beserta screenshot beranotasi, redirect chain, dan skor risiko lengkap.' },
                { icon: <Smartphone className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15', title: 'Scan APK', desc: 'Analisis izin berbahaya, deteksi malware, dan overlay detection pada file APK Android.' },
                { icon: <FileText className="w-5 h-5" />, color: 'text-rose-600 bg-rose-100 dark:bg-rose-500/15', title: 'Laporan Forensik', desc: 'Laporan PDF profesional siap digunakan sebagai bukti untuk laporan resmi ke pihak berwajib.' },
              ].map((f) => (
                <div key={f.title} className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${f.color}`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison Table ──────────────────── */}
        <section id="cara-kerja" className="py-16">
          <div className="container mx-auto px-5 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Kenapa PhishDeep Lebih Baik?</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Tidak hanya mendeteksi — kami memberikan bukti nyata yang bisa digunakan.</p>
            </div>

            <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/2">Fitur</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center w-1/4">Tools Lain</th>
                    <th className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400 text-center w-1/4">PhishDeep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {[
                    ['Deteksi phishing / malware', true],
                    ['Screenshot bukti visual', false],
                    ['Kotak merah area scam', false],
                    ['Redirect chain lengkap', false],
                    ['Laporan PDF forensik', false],
                    ['Bukti siap laporan polisi', false],
                  ].map(([label, other]) => (
                    <tr key={String(label)} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-700 dark:text-gray-300">{label as string}</td>
                      <td className="px-6 py-3.5 text-center text-base">
                        {other ? <span className="text-gray-400">✓</span> : <span className="text-red-400">✕</span>}
                      </td>
                      <td className="px-6 py-3.5 text-center text-green-500 font-bold text-base">✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-600 dark:text-gray-400">
              {['Gratis Digunakan', 'Privasi Terjaga', 'File Auto-Delete 24 Jam', 'Aman & Terpercaya'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog CTA ──────────────────────────── */}
        <section id="blog" className="py-12 border-t border-gray-100 dark:border-white/5">
          <div className="container mx-auto px-5 text-center max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Blog & Edukasi Keamanan Siber</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Pelajari tren phishing terbaru dan cara melindungi diri dari serangan siber.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 group">
              Lihat Artikel Blog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ── About CTA ─────────────────────────── */}
        <section id="tentang" className="py-12 border-t border-gray-100 dark:border-white/5">
          <div className="container mx-auto px-5 text-center max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Tentang PhishDeep</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Tim yang berdedikasi untuk ruang digital yang lebih aman bagi seluruh masyarakat Indonesia.</p>
            <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 group">
              Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
