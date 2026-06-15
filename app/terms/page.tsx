import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-white dark:bg-transparent pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Syarat & Ketentuan Layanan</h1>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8 text-xs sm:text-sm">Terakhir Diperbarui: 09 Juni 2026</p>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>Selamat datang di PhishDeep. Dengan menggunakan layanan kami, Anda menyetujui persyaratan berikut ini.</p>
            
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">1. Penggunaan Layanan</h2>
              <p>PhishDeep ditujukan untuk keperluan deteksi ancaman, analisis forensik, dan edukasi keamanan siber. Dilarang keras menggunakan tool ini untuk meretas, merekayasa balik sistem keamanan, atau aktivitas ilegal lainnya.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">2. Batas Penggunaan</h2>
              <p>Pengguna gratis dibatasi hingga 10 pemindaian per hari. Penyalahgunaan batas ini, seperti menggunakan skrip otomatisasi untuk mem-bypass kuota, dapat mengakibatkan penangguhan akun secara permanen.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">3. Penafian Hasil</h2>
              <p>Meskipun kami menggunakan algoritma dan machine learning yang canggih, kami tidak dapat menjamin deteksi 100% akurat untuk setiap ancaman (selalu ada risiko False Positive/Negative). Laporan yang kami berikan adalah referensi indikatif.</p>
            </div>

            <p className="pt-6 border-t border-gray-200 dark:border-slate-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Dengan menggunakan PhishDeep, Anda menyatakan telah membaca dan menyetujui syarat & ketentuan ini.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
