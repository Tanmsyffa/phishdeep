import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import { Mail, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-white dark:bg-slate-900 pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">Hubungi Kami</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">Tim kami siap membantu Anda dengan pertanyaan seputar layanan PhishDeep, laporan bug, atau kerjasama.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Form */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-5">Kirimkan Pesan</h2>
              <form action="https://formsubmit.co/sultantammam3@gmail.com" method="POST" className="space-y-4 sm:space-y-6">
                <input type="hidden" name="_next" value="http://localhost:3000/contact?success=true" />
                <input type="hidden" name="_captcha" value="false" />
                
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Depan</label>
                    <input type="text" name="first_name" required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="Budi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Belakang</label>
                    <input type="text" name="last_name" required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="Santoso" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input type="email" name="email" required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="budi@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pesan</label>
                  <textarea name="message" required rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="Tulis pesan Anda di sini..."></textarea>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-700 transition-colors shadow-sm text-sm sm:text-base">
                  Kirim Pesan
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 h-fit">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-5">Informasi Kontak</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/40 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">sultantammam3@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/40 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Telepon</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">+62 811 1234 5678</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
