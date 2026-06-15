import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { ArrowRight, Calendar } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";

export default function BlogPage() {
  const articles = blogArticles;
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-slate-800 pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">Blog Keamanan Siber</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">Tingkatkan kesadaran keamanan digital Anda dengan artikel, tips, dan update terbaru seputar ancaman siber.</p>
          </div>

          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-10 sm:mb-16">
              <article className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row">
                <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                  <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {featuredArticle.category}
                  </div>
                </div>
                <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0" /> {featuredArticle.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary-600 transition-colors">{featuredArticle.title}</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">{featuredArticle.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
                        {featuredArticle.author.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{featuredArticle.author}</span>
                    </div>
                    <Link href={`/blog/${featuredArticle.id}`} className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors bg-blue-50 dark:bg-blue-500/20 px-4 py-2 rounded-xl hover:bg-blue-100 dark:bg-blue-500/40">
                      Baca <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Regular Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularArticles.map(article => (
              <article key={article.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group">
                <div className="h-48 bg-gray-200 dark:bg-slate-700 overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/90 backdrop-blur text-gray-900 dark:text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {article.category}
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-3 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0" /> {article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary-600 transition-colors">{article.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed line-clamp-3">{article.excerpt}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{article.author}</span>
                    <Link href={`/blog/${article.id}`} className="inline-flex items-center gap-1 text-primary-600 font-semibold text-xs hover:text-primary-700 transition-colors">
                      Baca <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
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
