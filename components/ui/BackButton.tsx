"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({ label = "Kembali", className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gray-50/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 backdrop-blur-xl shadow-sm
        text-sm font-medium text-gray-600 dark:text-gray-300
        transition-all duration-200
        hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200/60 dark:hover:border-blue-500/30 hover:bg-blue-50/60 dark:hover:bg-white/10 hover:shadow-md
        active:scale-95 active:bg-blue-100/60 dark:active:-/20 active:text-blue-700 dark:active:text-blue-300
        group select-none
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
      {label}
    </button>
  );
}
