import Link from 'next/link'
import { login } from '@/app/auth-actions'
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-12 sm:mt-0">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-10 w-10 text-primary-600" />
              <span className="font-bold text-2xl tracking-tight text-primary-900">PhishDeep</span>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Selamat Datang Kembali</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Masuk untuk melihat riwayat scan dan laporan Anda.</p>
          
          {searchParams?.message && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{searchParams.message}</span>
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                name="email"
                placeholder="anda@email.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              </div>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 mt-4"
            >
              Masuk
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
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
