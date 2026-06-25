import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-ios-bg dark:bg-ios-bgDark pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow bg-white dark:bg-transparent pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Kebijakan Privasi</h1>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8 text-xs sm:text-sm">Terakhir Diperbarui: 09 Juni 2026</p>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>Privasi Anda adalah prioritas utama bagi PhishDeep. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
            
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">1. Data yang Kami Kumpulkan</h2>
              <p>Saat Anda menggunakan layanan kami, kami memproses URL atau file APK yang Anda unggah untuk dianalisis. Kami tidak mengekstrak data pribadi di dalam file tersebut untuk kepentingan lain selain pemindaian ancaman malware dan phishing.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">2. Retensi Data</h2>
              <p>Semua file yang diunggah ke sistem kami hanya disimpan sementara di lingkungan terisolasi (sandbox) dan akan dihapus secara otomatis dalam waktu maksimal 24 jam. Hasil analisis (screenshot dan skor risiko) disimpan dalam riwayat akun Anda.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">3. Keamanan Informasi</h2>
              <p>Kami menerapkan standar keamanan enkripsi terkini untuk melindungi semua transmisi data yang masuk maupun keluar dari sistem PhishDeep.</p>
            </div>
            
            <p className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami di sultantammam3@gmail.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
