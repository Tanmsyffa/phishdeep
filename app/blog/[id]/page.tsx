import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { Calendar } from "lucide-react";
import { blogArticles } from "@/lib/data/blog";
import { notFound } from "next/navigation";

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const article = blogArticles.find(a => a.id === params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-white pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-7">
            <BackButton label="Kembali ke Artikel" />
          </div>
          
          <article>
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="bg-primary-100 text-primary-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-md">
                  {article.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium">
                  <Calendar className="w-4 h-4 shrink-0" /> {article.date}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">{article.readTime}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border-2 border-white shadow-sm">
                  {article.author.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{article.author}</p>
                  <p className="text-xs text-gray-500">Penulis Keamanan Siber</p>
                </div>
              </div>
            </div>
            
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-100 rounded-3xl overflow-hidden mb-12 shadow-md">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>

            <div className="prose prose-base sm:prose-lg prose-blue max-w-3xl mx-auto text-gray-700 leading-relaxed font-serif">
              <p className="text-lg sm:text-xl text-gray-600 font-sans italic border-l-4 border-gray-200 pl-4 mb-8">
                {article.excerpt}
              </p>
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-5 text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
