"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { ShieldCheck, Menu } from "lucide-react";
import LiveNotifications from "@/components/ui/LiveNotifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-ios-bg dark:bg-ios-bgDark flex-col md:flex-row relative print:h-auto print:overflow-visible print:bg-white transition-colors duration-300">
      <LiveNotifications />
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-ios-bg/80 dark:bg-ios-cardDark/80 backdrop-blur-2xl text-gray-900 dark:text-white z-40 border-b border-gray-200/50 dark:border-white/5 transition-colors print:hidden supports-[backdrop-filter]:bg-ios-bg/60 dark:supports-[backdrop-filter]:bg-ios-cardDark/60">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-base">PhishDeep</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
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
