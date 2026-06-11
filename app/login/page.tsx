import Link from 'next/link'
import { signInWithGoogle } from '@/app/auth-actions'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <BackButton label="Kembali ke Beranda" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-10 w-10 text-primary-600" />
              <span className="font-bold text-2xl tracking-tight text-primary-900">PhishDeep</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Selamat Datang Kembali</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Masuk untuk melihat riwayat scan dan laporan Anda.
          </p>

          {/* Error Message */}
          {searchParams?.message && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{searchParams.message}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">Aman & Terenkripsi</span>
            </div>
          </div>

          {/* Trust badges */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Dengan masuk, Anda menyetujui{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Kebijakan Privasi</Link>{' '}kami.
          </p>

          <div className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary-600 font-semibold hover:underline">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
