import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Bagaimana cara kerja PhishDeep?",
      a: "PhishDeep memindai URL atau file APK Anda di lingkungan tersolasi (sandbox). Kami menganalisis perilaku, metadata, sertifikat SSL, dan konten visual halaman untuk mendeteksi ancaman secara otomatis."
    },
    {
      q: "Apakah data saya aman?",
      a: "Ya. Kami hanya menyimpan hasil scan dan screenshot sebagai bukti. File yang diunggah akan dihapus secara otomatis dalam waktu 24 jam. Kami tidak pernah meminta data pribadi dari file Anda."
    },
    {
      q: "Apa perbedaan PhishDeep dengan tool scanner lain?",
      a: "PhishDeep tidak hanya memberi label 'berbahaya' atau 'aman'. Kami memberikan bukti visual konkret seperti screenshot dengan kotak merah pada area yang menipu (misalnya form login palsu), redirect chain, dan laporan PDF yang siap digunakan untuk penegakan hukum."
    },
    {
      q: "Apakah layanan ini gratis?",
      a: "Ya, PhishDeep 100% gratis digunakan oleh publik dengan batasan wajar sebanyak 10 scan per hari per pengguna, untuk menjaga stabilitas sistem kami."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-transparent pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">Pertanyaan Seputar PhishDeep</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">Temukan jawaban untuk pertanyaan umum mengenai layanan kami.</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 p-5 sm:p-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 dark:bg-blue-500/20 text-primary-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-2 leading-snug">{faq.q}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4">Masih ada pertanyaan lain?</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm sm:text-base shadow-sm">
              Hubungi Tim Kami
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
