import Link from 'next/link'
import { signup } from '@/app/auth-actions'
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const isSuccess = searchParams?.message?.includes('berhasil');

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
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Buat Akun Gratis</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Bergabung untuk mulai memindai dan menyimpan laporan.</p>
          
          {searchParams?.message && (
            <div className={`${isSuccess ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'} px-4 py-3 rounded-lg mb-6 flex items-start gap-2 text-sm border`}>
              {isSuccess ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{searchParams.message}</span>
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full_name">Nama Lengkap</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                name="full_name"
                placeholder="Nama Anda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                name="email"
                type="email"
                placeholder="anda@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                type="password"
                name="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
            
            <button
              className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 mt-4"
            >
              Daftar Sekarang
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
