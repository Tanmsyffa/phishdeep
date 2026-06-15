import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Link as LinkIcon, Smartphone, FileSearch } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-10 pb-16 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-primary-700 dark:text-primary-300 text-[10px] xs:text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm max-w-full">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="leading-tight truncate sm:whitespace-normal">Deteksi Phishing & Malware dengan Bukti Visual</span>
                </div>
                
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-4 sm:mb-6">
                  Jangan cuma tahu <br className="hidden sm:block"/>
                  link berbahaya. <br className="hidden lg:block"/>
                  <span className="text-primary-600">Lihat bukti nyatanya.</span>
                </h1>
                
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-xl leading-relaxed px-2 sm:px-0">
                  PhishDeep mendeteksi phishing, malware, dan ancaman lain pada link dan APK dilengkapi bukti visual lengkap yang siap digunakan.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto px-4 sm:px-0 justify-center lg:justify-start">
                  <Link href="/scan" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-primary-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-600/20 text-sm sm:text-lg hover:shadow-xl hover:-translate-y-1 group">
                    Scan Gratis Sekarang <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-600 dark:text-gray-300 justify-center lg:justify-start font-medium mx-auto lg:mx-0">
                  <div className="flex items-center gap-2.5 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Kotak merah di area scam</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Laporan PDF forensik</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                <div className="relative w-full max-w-[600px] mx-auto aspect-[4/3] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  {/* Browser Mockup */}
                  <div className="h-10 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto bg-white dark:bg-slate-900 text-xs text-gray-500 dark:text-gray-400 px-4 py-1 rounded-md border border-gray-200 dark:border-slate-700 flex items-center gap-2 w-2/3 truncate">
                      <span className="text-green-600 dark:text-green-400">🔒</span> https://secure-login-banking.com/login
                    </div>
                  </div>
                  <div className="p-8 bg-gray-50 dark:bg-slate-800 h-full">
                    <div className="bg-primary-900 text-white p-4 rounded-t-lg font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-xs">B</div>
                        <span>BANK XYZ</span>
                      </div>
                      <span className="text-sm font-normal text-gray-300">Internet Banking</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 border border-gray-200 dark:border-slate-700 rounded-b-lg shadow-sm">
                      <h3 className="font-bold mb-4">Login ke Internet Banking</h3>
                      <div className="space-y-4">
                        <div className="h-10 border border-gray-300 rounded px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">Email atau Username</div>
                        <div className="h-10 border border-gray-300 rounded px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">Password</div>
                        <div className="h-10 bg-primary-900 rounded flex items-center justify-center text-white font-medium">Masuk</div>
                      </div>
                    </div>
                    
                    {/* The Red Box Evidence Simulation */}
                    <div className="absolute top-[35%] left-[10%] right-[10%] bottom-[10%] border-2 md:border-4 border-red-500 border-dashed rounded bg-red-500/10 dark:bg-red-500/20 animate-pulse"></div>
                    <div className="absolute top-[50%] left-1/2 md:left-auto md:right-4 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-3 py-2 rounded shadow-lg flex flex-col md:flex-row items-center gap-1 md:gap-2 z-10 w-max max-w-[90%] text-center md:text-left">
                       <span>Form Login Palsu</span> <span className="font-normal opacity-90">(Masukkan data)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* Features Section */}
        <section id="fitur" className="py-12 bg-gray-50 dark:bg-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Fitur Utama PhishDeep</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">Kami menyediakan berbagai alat pemindaian untuk memastikan Anda aman dari ancaman siber.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-5 sm:p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/40 text-primary-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Scan Link</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Deteksi phishing pada link beserta screenshot, anotasi, dan redirect chain lengkap.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-5 sm:p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Scan APK</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Analisis izin berbahaya, deteksi malware, dan overlay detection.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-5 sm:p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Bukti Forensik</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Laporan PDF forensik siap digunakan untuk bukti dan laporan resmi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="cara-kerja" className="py-12 bg-white dark:bg-transparent">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Kenapa PhishDeep Lebih Baik?</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                    <th className="p-3 sm:p-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base w-1/2">Fitur</th>
                    <th className="p-3 sm:p-6 font-semibold text-gray-900 dark:text-white text-center text-sm sm:text-base w-1/4">Tools Lain</th>
                    <th className="p-3 sm:p-6 font-bold text-primary-600 dark:text-primary-400 text-center text-sm sm:text-base w-1/4 bg-blue-50 dark:bg-blue-500/20">PhishDeep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Deteksi phishing / malware</td>
                    <td className="p-3 sm:p-6 text-center text-gray-400 dark:text-gray-500 text-base sm:text-lg">✓</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Screenshot bukti visual</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Kotak merah area scam</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Redirect chain lengkap</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Laporan PDF forensik</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-6 text-gray-700 dark:text-gray-300 text-xs sm:text-base">Bukti siap untuk laporan polisi</td>
                    <td className="p-3 sm:p-6 text-center text-red-400 text-base sm:text-lg">✕</td>
                    <td className="p-3 sm:p-6 text-center text-green-600 dark:text-green-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-base sm:text-lg">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Gratis Digunakan</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Privasi Terjaga</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> File Auto-Delete 24 Jam</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Aman & Terpercaya</div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-10 sm:py-12 bg-gray-50 dark:bg-transparent border-t border-gray-200 dark:border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Blog & Edukasi Keamanan Siber</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">Pelajari lebih lanjut tentang tren phishing, teknik terbaru malware, dan bagaimana Anda bisa melindungi diri dari serangan siber.</p>
            <Link href="/blog" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-white hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-md group">Lihat Artikel Blog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
        </section>

        {/* Tentang Section */}
        <section id="tentang" className="py-10 sm:py-12 bg-white dark:bg-transparent border-t border-gray-200 dark:border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Tentang PhishDeep</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">Kami adalah tim yang berdedikasi untuk menciptakan ruang digital yang lebih aman bagi semua orang di Indonesia. Misi kami adalah memberikan bukti, bukan sekadar peringatan.</p>
            <Link href="/about" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-white hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-md group">Selengkapnya Tentang Kami <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
