import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { ArrowRight, Calendar } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";

export default function BlogPage() {
  const articles = blogArticles;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-gray-50 pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">Blog Keamanan Siber</h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Tingkatkan kesadaran keamanan digital Anda dengan artikel, tips, dan update terbaru seputar ancaman siber.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {articles.map(article => (
              <article key={article.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="h-44 sm:h-48 bg-gray-200 overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    {article.category}
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" /> {article.date}
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2.5 leading-snug">{article.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-5 flex-grow leading-relaxed">{article.excerpt}</p>
                  <Link href={`/blog/${article.id}`} className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors group">
                    Baca Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
