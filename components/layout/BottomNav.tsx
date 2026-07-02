"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, History, FileText, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Beranda",  icon: Home },
  { href: "/scan",      label: "Scan",     icon: ScanLine },
  { href: "/history",   label: "Riwayat",  icon: History },
  { href: "/reports",   label: "Laporan",  icon: FileText },
  { href: "/settings",  label: "Setelan",  icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/scan") return pathname.includes("/scan");
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Frosted glass bar */}
      <div className="mx-3 mb-3 bg-ios-bg/80 dark:bg-white/10 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
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
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${
                    active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
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
