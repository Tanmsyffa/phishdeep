import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman {title}</h1>
        <p className="text-gray-500 mb-6">Halaman ini sedang dalam tahap pengembangan (MVP).</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
