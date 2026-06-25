"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { logout } from "@/app/auth-actions";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PublicBottomNav from "@/components/layout/PublicBottomNav";

export default function Header() {
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
    return () => { subscription.unsubscribe(); };
  }, [supabase.auth]);

  return (
    <>
      {/* ── Top Header Bar ───────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-white/10 bg-ios-bg/85 dark:bg-white/10 backdrop-blur-2xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">PhishDeep</span>
          </Link>

          {/* Desktop Nav — hidden on mobile/tablet, shown on lg+ */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "/",          label: "Beranda" },
              { href: "/fitur",     label: "Fitur" },
              { href: "/cara-kerja",label: "Cara Kerja" },
              { href: "/blog",      label: "Blog" },
              { href: "/about",     label: "Tentang" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <div className="h-5 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <form action={logout}>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile right side — only ThemeToggle */}
          <div className="flex lg:hidden items-center">
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* ── Public Bottom Nav — Mobile/Tablet only ─ */}
      <PublicBottomNav />
    </>
  );
}
