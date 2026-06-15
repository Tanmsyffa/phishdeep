import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";

export default function BlogPage() {
  const articles = blogArticles;
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        
        {/* Hero */}
        <section className="pt-8 pb-14 border-b border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-5">
                <BookOpen className="w-3.5 h-3.5 shrink-0" /> Edukasi
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
                Blog <span className="text-primary-600">Keamanan Siber</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Tingkatkan kesadaran keamanan digital Anda dengan artikel, tips, dan update terbaru seputar ancaman siber.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-16">
                <article className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
                    <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {featuredArticle.category}
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0" /> {featuredArticle.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{featuredArticle.title}</h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed line-clamp-3">{featuredArticle.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">
                          {featuredArticle.author.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{featuredArticle.author}</span>
                      </div>
                      <Link href={`/blog/${featuredArticle.id}`} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm hover:text-primary-700 dark:hover:text-primary-300 transition-colors bg-blue-50 dark:bg-blue-500/10 px-5 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20">
                        Baca Artikel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* Regular Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularArticles.map(article => (
                <article key={article.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="h-48 bg-gray-200 dark:bg-slate-800 overflow-hidden relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-gray-900 dark:text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md shadow-sm border border-gray-200/50 dark:border-slate-700/50">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0" /> {article.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{article.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed line-clamp-3">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{article.author}</span>
                      <Link href={`/blog/${article.id}`} className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold text-xs hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                        Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
