import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { ArrowRight, Calendar, Clock, BookOpen, Tag } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Berita":   { bg: "bg-blue-50 dark:bg-blue-500/20",    text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800" },
  "Laporan":  { bg: "bg-purple-50 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  "Malware":  { bg: "bg-red-50 dark:bg-red-500/20",      text: "text-red-700 dark:text-red-300",     border: "border-red-200 dark:border-red-800" },
  "Phishing": { bg: "bg-orange-50 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
};

function CategoryBadge({ category }: { category: string }) {
  const c = categoryColors[category] ?? { bg: "bg-gray-100 dark:bg-slate-700", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <Tag className="w-2.5 h-2.5" />
      {category}
    </span>
  );
}

export const metadata = {
  title: "Blog Keamanan Siber | PhishDeep",
  description: "Artikel, laporan, dan tips terbaru seputar ancaman siber, phishing, dan keamanan digital di Indonesia.",
};

export default function BlogPage() {
  const articles = blogArticles;
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-ios-bg dark:bg-ios-bgDark pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow">

        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="border-b border-gray-200/50 dark:border-white/5 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5 shrink-0" /> Edukasi & Berita Siber
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                Blog <span className="text-blue-600 dark:text-blue-400">Keamanan Siber</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                Tingkatkan kesadaran keamanan digital Anda dengan artikel, tips, dan update terbaru seputar ancaman siber.
              </p>
              {/* Stats row */}
              <div className="flex items-center gap-4 sm:gap-6 mt-2">
                {[
                  { label: "Artikel", val: articles.length },
                  { label: "Kategori", val: Array.from(new Set(articles.map(a => a.category))).length },
                  { label: "Penulis", val: Array.from(new Set(articles.map(a => a.author))).length },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{s.val}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────── */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-10 sm:mb-16">
                <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-4 pl-1">Artikel Utama</p>
                <Link href={`/blog/${featuredArticle.id}`} className="group block">
                  <article className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-5/12 h-52 sm:h-64 md:h-auto bg-gray-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
                      <img
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={featuredArticle.category} />
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <Calendar className="w-3 h-3" /> {featuredArticle.date}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="w-3 h-3" /> {featuredArticle.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 pt-5 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0">
                            {featuredArticle.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{featuredArticle.author}</p>
                            <p className="text-[11px] text-gray-400">Penulis Keamanan Siber</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-500/10 px-5 py-2.5 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors shrink-0">
                          Baca Artikel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* Section divider */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 shrink-0">Artikel Lainnya</p>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
            </div>

            {/* Regular Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
              {regularArticles.map(article => (
                <Link key={article.id} href={`/blog/${article.id}`} className="group block">
                  <article className="bg-ios-card/80 dark:bg-ios-cardDark/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    {/* Image */}
                    <div className="h-44 sm:h-48 bg-gray-200 dark:bg-slate-800 overflow-hidden relative shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CategoryBadge category={article.category} />
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-grow">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{article.date}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{article.readTime}</span>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1 group-hover:gap-2 transition-all">
                          Baca <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
