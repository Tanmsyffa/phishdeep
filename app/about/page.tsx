import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import { ShieldCheck, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-white dark:bg-transparent pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">Tentang PhishDeep</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Kami berdedikasi untuk menciptakan ruang digital yang lebih aman bagi seluruh masyarakat Indonesia dengan memberikan bukti forensik, bukan sekadar peringatan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 mb-12">
            <div className="bg-gray-50 dark:bg-slate-800 p-6 sm:p-8 rounded-2xl text-center border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 dark:bg-blue-500/20 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">Misi Kami</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Memberantas penipuan digital dengan menyediakan alat deteksi yang mudah digunakan, akurat, dan dapat memberikan bukti visual untuk orang awam maupun profesional.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 sm:p-8 rounded-2xl text-center border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 dark:bg-blue-500/20 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">Visi Kami</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Menjadi platform verifikasi keamanan siber terdepan di Indonesia yang dipercaya oleh individu, UMKM, instansi pendidikan, hingga perusahaan besar.</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-6 sm:p-8 rounded-2xl text-center border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 dark:bg-blue-500/20 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">Tim Kami</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Terdiri dari para penggiat keamanan siber, pengembang perangkat lunak, dan analis malware yang peduli terhadap tingginya angka penipuan online.</p>
            </div>
          </div>

          <div className="bg-primary-900 text-white rounded-2xl sm:rounded-3xl p-7 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bersama Membangun Internet yang Aman</h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-0 text-sm sm:text-lg leading-relaxed">
              Setiap harinya ribuan URL phishing baru bermunculan. Dengan menggunakan PhishDeep, Anda turut berkontribusi dalam memetakan dan menghentikan pergerakan pelaku kejahatan siber.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
