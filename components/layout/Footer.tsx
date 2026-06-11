import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-7 w-7 text-white" />
              <span className="font-bold text-lg tracking-tight text-white">PhishDeep</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Deteksi phishing dan malware dengan bukti visual. Lebih dari sekadar peringatan.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-white">Produk</h3>
            <ul className="space-y-2.5">
              <li><Link href="/fitur" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Fitur</Link></li>
              <li><Link href="/cara-kerja" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Cara Kerja</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-white">Perusahaan</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Tentang Kami</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-4 text-white">Bantuan</h3>
            <ul className="space-y-2.5">
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PhishDeep. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
