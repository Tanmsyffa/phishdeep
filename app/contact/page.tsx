import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-ios-bg dark:bg-ios-bgDark pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow">
        
        {/* Hero */}
        <section className="pt-8 pb-14 border-b border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-5">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" /> Hubungi Kami
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
                Kami Siap <span className="text-primary-600">Membantu</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Tim kami siap membantu Anda dengan pertanyaan seputar layanan PhishDeep, laporan bug, atau rencana kerjasama bisnis.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              
              {/* Form Section */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kirimkan Pesan</h2>
                <form action="https://formsubmit.co/sultantammam3@gmail.com" method="POST" className="space-y-5">
                  <input type="hidden" name="_next" value="http://localhost:3000/contact?success=true" />
                  <input type="hidden" name="_captcha" value="false" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Depan</label>
                      <input type="text" name="first_name" required className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-700 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Belakang</label>
                      <input type="text" name="last_name" required className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-700 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Alamat Email</label>
                    <input type="email" name="email" required className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-700 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pesan Anda</label>
                    <textarea name="message" required rows={6} className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-700 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none" placeholder="Jelaskan kebutuhan atau pertanyaan Anda di sini..."></textarea>
                  </div>
                  
                  <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2">
                    Kirim Pesan Sekarang
                  </button>
                </form>
              </div>

              {/* Info Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informasi Kontak</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Email</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">sultantammam3@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Telepon</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">+62 811 1234 5678</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl border border-blue-200/60 dark:border-blue-500/20 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Butuh Respon Cepat?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    Untuk pelaporan insiden keamanan atau ancaman siber berskala besar, sertakan subject [URGENT] pada email Anda.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
