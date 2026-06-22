import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { Calendar, Clock, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";
import { notFound } from "next/navigation";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Berita":   { bg: "bg-blue-50 dark:bg-blue-500/20",    text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800" },
  "Laporan":  { bg: "bg-purple-50 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  "Malware":  { bg: "bg-red-50 dark:bg-red-500/20",      text: "text-red-700 dark:text-red-300",     border: "border-red-200 dark:border-red-800" },
  "Phishing": { bg: "bg-orange-50 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
};

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const article = blogArticles.find(a => a.id === params.id);
  if (!article) notFound();

  const articleIndex = blogArticles.findIndex(a => a.id === params.id);
  const prevArticle = articleIndex > 0 ? blogArticles[articleIndex - 1] : null;
  const nextArticle = articleIndex < blogArticles.length - 1 ? blogArticles[articleIndex + 1] : null;
  const relatedArticles = blogArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 2);

  const c = categoryColors[article.category] ?? { bg: "bg-gray-100 dark:bg-slate-700", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-slate-600" };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-slate-950">
      <Header />
      <main className="flex-grow">

        {/* ── Hero Banner ─────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-6 sm:py-8">
            <div className="mb-5">
              <BackButton label="Kembali ke Blog" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${c.bg} ${c.text} ${c.border}`}>
                <Tag className="w-2.5 h-2.5" />
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="w-3 h-3 shrink-0" /> {article.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3 shrink-0" /> {article.readTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-5">
              {article.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{article.author}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Penulis Keamanan Siber</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8 sm:py-12">

          {/* Hero Image */}
          <div className="w-full aspect-video bg-gray-200 dark:bg-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-12 shadow-md">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <article className="max-w-3xl mx-auto">
            {/* Lead paragraph */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium italic border-l-4 border-blue-400 dark:border-blue-500 pl-4 sm:pl-5 mb-8 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Body paragraphs */}
            <div className="space-y-5">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed sm:leading-loose">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1">Topik:</span>
              {[article.category, "Keamanan Siber", "Indonesia"].map(tag => (
                <span key={tag} className="text-[11px] px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-slate-700 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* ── Prev / Next Navigation ───────────────────── */}
          {(prevArticle || nextArticle) && (
            <div className="max-w-3xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevArticle ? (
                <Link href={`/blog/${prevArticle.id}`} className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 shrink-0 mt-0.5 group-hover:-translate-x-0.5 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Sebelumnya</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{prevArticle.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {nextArticle ? (
                <Link href={`/blog/${nextArticle.id}`} className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all sm:text-right sm:flex-row-reverse">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Selanjutnya</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{nextArticle.title}</p>
                  </div>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* ── Related Articles ──────────────────────────── */}
          {relatedArticles.length > 0 && (
            <div className="max-w-3xl mx-auto mt-12">
              <div className="flex items-center gap-3 mb-5">
                <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 shrink-0">Artikel Terkait</p>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={`/blog/${rel.id}`} className="group flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0">
                      <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 mb-1">{rel.date} · {rel.readTime}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">{rel.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Back to Blog ──────────────────────────────── */}
          <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <BackButton label="Kembali ke Daftar Artikel" />
            <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Lihat Semua Artikel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
