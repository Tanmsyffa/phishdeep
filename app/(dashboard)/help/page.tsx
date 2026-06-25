import { HelpCircle, Mail, ArrowRight, BookOpen, MessageSquare, Zap, Shield, Clock, Info } from "lucide-react";
import Link from "next/link";

const quickTips = [
  {
    q: "Bagaimana cara scan link?",
    a: "Pergi ke halaman \"Scan Baru\", pilih tab Link, masukkan URL lalu klik Scan Sekarang.",
    icon: Zap,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    q: "Berapa batas scan per hari?",
    a: "Setiap akun mendapat kuota 10 scan per hari. Kuota direset setiap tengah malam WIB.",
    icon: Clock,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
  },
  {
    q: "Apakah file saya disimpan?",
    a: "Tidak. File Anda otomatis dihapus dari server segera setelah analisis selesai.",
    icon: Shield,
    color: "text-green-500 bg-green-50 dark:bg-green-500/10",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Pusat Bantuan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Butuh bantuan dengan layanan PhishDeep?</p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/8 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Pertanyaan Umum</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Temukan jawaban atas pertanyaan yang sering diajukan seputar hasil scan dan cara penggunaan.
            </p>
          </div>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-2.5 transition-all group"
          >
            Baca FAQ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/8 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Hubungi Support</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Tim kami siap membantu menyelesaikan kendala teknis melalui email resmi.
            </p>
          </div>
          <a
            href="mailto:support@phishdeep.id"
            className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm hover:gap-2.5 transition-all group"
          >
            <Mail className="w-4 h-4" /> Kirim Email <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100/80 dark:border-white/5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> Panduan Cepat
          </h3>
        </div>
        <div className="divide-y divide-gray-100/80 dark:divide-white/5">
          {quickTips.map((item, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">{item.q}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info card */}
      <div className="bg-blue-50/60 dark:bg-blue-500/8 border border-blue-100 dark:border-blue-500/15 rounded-2xl px-5 py-4 flex items-center gap-3">
        <Mail className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Butuh bantuan mendesak? Email kami di{" "}
          <a href="mailto:support@phishdeep.id" className="font-bold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-200">
            support@phishdeep.id
          </a>
        </p>
      </div>

    </div>
  );
}
