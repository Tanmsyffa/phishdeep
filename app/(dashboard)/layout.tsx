"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50 flex-col md:flex-row relative print:h-auto print:overflow-visible print:bg-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white text-gray-900 z-40 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-base">PhishDeep</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative z-0 print:overflow-visible print:h-auto print:block">
        <div className="p-4 md:p-8 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
