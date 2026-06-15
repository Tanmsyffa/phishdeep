"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { logout } from "@/app/auth-actions";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary-600" />
          <span className="font-bold text-xl tracking-tight text-primary-900 dark:text-white">PhishDeep</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Beranda</Link>
          <Link href="/fitur" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Fitur</Link>
          <Link href="/cara-kerja" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Cara Kerja</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Blog</Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Tentang</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <form action={logout}>
                <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                Masuk
              </Link>
              <Link href="/register" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Daftar Gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full left-0 shadow-xl border-b pb-4">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">Beranda</Link>
            <Link href="/fitur" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">Fitur</Link>
            <Link href="/cara-kerja" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">Cara Kerja</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">Blog</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">Tentang</Link>
          </nav>
          <div className="px-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-center text-white bg-primary-600 px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <form action={logout} className="flex flex-col">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-center text-red-600 border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-center bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors">
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
