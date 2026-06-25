import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import { HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col font-sans bg-ios-bg dark:bg-ios-bgDark pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow">
        
        {/* Hero */}
        <section className="pt-8 pb-14 border-b border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" /> FAQ
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
                Pertanyaan Seputar <span className="text-primary-600">PhishDeep</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Temukan jawaban untuk pertanyaan umum mengenai layanan dan fitur keamanan kami.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-5 p-6 sm:p-8">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-primary-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 rounded-xl flex items-center justify-center shrink-0 font-black text-sm mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 leading-snug">{faq.q}</h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <MessageCircle className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Masih ada pertanyaan lain?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-8 max-w-sm mx-auto">
                Tim support kami siap membantu Anda dengan pertanyaan spesifik lainnya.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                Hubungi Tim Kami
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
