import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white pt-12 pb-8 border-t border-gray-100 dark:border-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">PhishDeep</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Deteksi phishing dan malware dengan bukti visual. Lebih dari sekadar peringatan.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-gray-900 dark:text-white">Produk</h3>
            <ul className="space-y-2.5">
              <li><Link href="/fitur" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Fitur</Link></li>
              <li><Link href="/cara-kerja" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Cara Kerja</Link></li>
              <li><Link href="/blog" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-gray-900 dark:text-white">Perusahaan</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Tentang Kami</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-gray-900 dark:text-white">Bantuan</h3>
            <ul className="space-y-2.5">
              <li><Link href="/faq" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm font-medium">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-white\/10 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} PhishDeep. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
