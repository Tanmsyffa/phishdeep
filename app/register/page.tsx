import Link from 'next/link'
import { signInWithGoogle } from '@/app/auth-actions'
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, Fingerprint, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex bg-ios-bg dark:bg-ios-bgDark">
      
      {/* Left Side - Visual Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between border-r border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-10" />
        
        {/* Subtle grid instead of glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 z-0" />
        
        <div className="relative z-20 p-12">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
            <span className="font-bold text-xl tracking-tight">PhishDeep</span>
          </Link>
        </div>

        <div className="relative z-20 p-12 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-slate-300 text-xs font-semibold tracking-wide mb-6">
            <Lock className="w-3.5 h-3.5 text-blue-400" /> Platform Analisis Forensik
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Bergabung Bersama <br />
            <span className="text-blue-500">Keamanan Cerdas.</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">
            Mulai lindungi perangkat Anda dan dapatkan akses ke laporan forensik mendetail yang terstandarisasi.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <Fingerprint className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Tanpa Password</h4>
                <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">Lebih aman dan cepat dengan sistem Single Sign-On Google.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Standar Global</h4>
                <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">Analisis keamanan Anda didukung framework internasional kelas enterprise.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 py-12 sm:p-12 relative bg-ios-bg dark:bg-ios-bgDark min-h-screen lg:min-h-0">
        
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
           <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="lg:hidden flex justify-center mb-10">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <ShieldCheck className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Buat Akun Gratis</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Bergabung dan mulai scan ancaman siber dalam hitungan detik. 100% gratis.
            </p>
          </div>

          {/* Benefits List (More prominent on mobile, visible on both) */}
          <div className="bg-blue-50 dark:bg-blue-900/20/50 border border-blue-100 dark:border-blue-800 rounded-xl p-5 mb-8 space-y-3">
            {[
              'Riwayat scan tersimpan otomatis',
              'Laporan PDF forensik siap unduh',
              'Analisis heuristik mendalam',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {searchParams?.message && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-xl mb-8 flex items-start gap-3 text-sm animate-in zoom-in-95">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium">{searchParams.message}</span>
            </div>
          )}

          {/* Google Sign Up Button */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-ios-cardDark border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gray-50 dark:bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 shrink-0 relative z-10" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span className="relative z-10">Daftar dengan Google</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500 font-medium">
              <span className="bg-white dark:bg-slate-950 px-4">AMAN & TERENKRIPSI</span>
            </div>
          </div>

          {/* Trust badges */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-8">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/terms" className="text-gray-600 dark:text-gray-300 font-semibold hover:text-gray-900 dark:text-white transition-colors">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy" className="text-gray-600 dark:text-gray-300 font-semibold hover:text-gray-900 dark:text-white transition-colors">Kebijakan Privasi</Link>{' '}kami.
          </p>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl py-4 border border-gray-100 dark:border-slate-800 mt-8">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Masuk
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
}
