"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Layers, BookOpen, Info, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/",          label: "Beranda", icon: Home },
  { href: "/fitur",     label: "Fitur",   icon: Layers },
  { href: "/blog",      label: "Blog",    icon: BookOpen },
  { href: "/about",     label: "Tentang", icon: Info },
];

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const authItem = isLoggedIn
    ? { href: "/dashboard", label: "Dashboard", icon: LogIn }
    : { href: "/login",    label: "Masuk",     icon: LogIn };

  const allItems = [...navItems, authItem];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 bg-ios-bg/85 dark:bg-ios-cardDark/85 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {allItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-90"
              >
                <span
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${
                    active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
