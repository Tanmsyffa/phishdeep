'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-2 rounded-lg border ${currentPage <= 1 ? 'pointer-events-none opacity-50 border-gray-100 dark:border-white\/10 text-gray-400' : 'border-gray-200 dark:border-white\/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'} transition-colors`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-4">
        Halaman {currentPage} dari {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-2 rounded-lg border ${currentPage >= totalPages ? 'pointer-events-none opacity-50 border-gray-100 dark:border-white\/10 text-gray-400' : 'border-gray-200 dark:border-white\/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'} transition-colors`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
