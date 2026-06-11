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
            <div className="mb-7">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                  <Calendar className="w-3.5 h-3.5 shrink-0" /> {article.date}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-7">
                {article.title}
              </h1>
              
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden mb-8">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="prose prose-sm sm:prose-lg prose-blue max-w-none text-gray-700 leading-relaxed">
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
