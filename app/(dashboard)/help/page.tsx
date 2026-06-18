import { HelpCircle, Mail, ArrowRight, BookOpen, MessageSquare } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Pusat Bantuan</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Butuh bantuan dengan layanan PhishDeep?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">FAQ</h3>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mb-5 leading-relaxed flex-1">Temukan jawaban atas pertanyaan yang sering diajukan seputar hasil scan dan cara penggunaan PhishDeep.</p>
          <a href="/faq" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:text-blue-400 transition-colors group mt-auto">
            Baca FAQ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">Hubungi Support</h3>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mb-5 leading-relaxed flex-1">Tim kami siap membantu Anda menyelesaikan kendala teknis melalui email resmi kami.</p>
          <a href="mailto:support@phishdeep.id" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:text-blue-400 transition-colors group mt-auto">
            <Mail className="w-4 h-4" /> Kirim Email <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">Panduan Cepat</h3>
        <div className="space-y-3">
          {[
            { q: 'Bagaimana cara scan link?', a: 'Pergi ke halaman "Scan Baru", pilih tab Link, masukkan URL lalu klik Scan Sekarang.' },
            { q: 'Berapa batas scan per hari?', a: 'Setiap akun mendapat kuota 10 scan per hari. Kuota direset setiap tengah malam WIB.' },
            { q: 'Apakah file saya disimpan?', a: 'Tidak. File Anda otomatis dihapus dari server segera setelah analisis selesai.' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/70 rounded-xl p-3.5 sm:p-4">
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.q}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
