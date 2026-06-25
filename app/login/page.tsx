import Link from 'next/link'
import { signInWithGoogle } from '@/app/auth-actions'
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, ShieldAlert } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex bg-ios-bg dark:bg-ios-bgDark pb-24 lg:pb-0">

      {/* ── Left Panel (Desktop) ─────────────────── */}
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-[#0A0A0A] relative overflow-hidden flex-col justify-between shrink-0">

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]/80" />

        {/* Orb — subtle, no neon */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-white/5 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">PhishDeep</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 p-10 pb-14 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-gray-400 text-xs font-semibold tracking-wide mb-5">
              <Lock className="w-3 h-3" /> Platform Analisis Forensik
            </div>
            <h1 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.2] tracking-tight">
              Standar Siber<br />
              <span className="text-blue-400">Internasional.</span>
            </h1>
            <p className="mt-4 text-gray-400 text-[15px] leading-relaxed max-w-sm">
              Lindungi identitas dan perangkat Anda dari ancaman malware, phishing, dan zero-day exploits.
            </p>
          </div>

          {/* Feature tiles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Lock className="w-4 h-4 text-blue-400" />,      title: 'Privasi Terjamin',   desc: 'File dihapus otomatis setelah analisis.' },
              { icon: <ShieldAlert className="w-4 h-4 text-blue-400" />, title: 'Cerdas & Presisi',  desc: 'Didukung MITRE ATT&CK & Google Safe Browsing.' },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ───────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 sm:p-10 relative min-h-screen lg:min-h-0">

        {/* Mobile back button */}
        <div className="absolute top-5 left-5 lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>

        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-6 duration-500">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-[20px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <ShieldCheck className="h-9 w-9 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">Selamat Datang</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Masuk untuk mengakses fitur analitik dan riwayat ancaman Anda.
            </p>
          </div>

          {/* Error */}
          {searchParams?.message && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-2xl mb-6 flex items-start gap-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{searchParams.message}</span>
            </div>
          )}

          {/* Google Button */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-ios-cardDark border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm transition-all duration-200 active:scale-[0.98] text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Lanjutkan dengan Google
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">AMAN & TERENKRIPSI</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-5">
            Dengan masuk, Anda menyetujui{' '}
            <Link href="/terms" className="text-gray-600 dark:text-gray-300 font-semibold hover:underline">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy" className="text-gray-600 dark:text-gray-300 font-semibold hover:underline">Kebijakan Privasi</Link> kami.
          </p>

          {/* Switch to register */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-2xl py-4 border border-gray-200/50 dark:border-white/5">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Daftar Gratis
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
