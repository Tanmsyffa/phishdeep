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
        inline-flex items-center gap-2 px-4 py-2 rounded-xl
        bg-white border border-gray-200 shadow-sm
        text-sm font-medium text-gray-600
        transition-all duration-200
        hover:text-primary-600 hover:border-primary-200 hover:bg-blue-50/60 hover:shadow-md
        active:scale-95 active:bg-blue-100/60 active:text-primary-700 active:border-primary-300
        group select-none
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
      {label}
    </button>
  );
}
