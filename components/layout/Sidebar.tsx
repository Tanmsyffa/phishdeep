"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth-actions";
import {
  ShieldCheck,
  Home,
  ScanLine,
  History,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Search
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    if (path === "/scan") return pathname.includes("/scan");
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard",    icon: Home,        section: "menu" },
    { href: "/search",    label: "Cari ID Scan", icon: Search,      section: "menu" },
    { href: "/scan",      label: "Scan Baru",    icon: ScanLine,    section: "menu" },
    { href: "/history",   label: "Riwayat Scan", icon: History,     section: "menu" },
    { href: "/reports",   label: "Laporan PDF",  icon: FileText,    section: "menu" },
    { href: "/settings",  label: "Pengaturan",   icon: Settings,    section: "other" },
    { href: "/help",      label: "Bantuan",      icon: HelpCircle,  section: "other" },
  ];

  const menuLinks = navLinks.filter(l => l.section === "menu");
  const otherLinks = navLinks.filter(l => l.section === "other");

  return (
    <aside
      className="w-60 xl:w-64 bg-ios-bg/90 dark:bg-ios-cardDark/90 backdrop-blur-2xl text-gray-900 dark:text-gray-100 h-screen sticky top-0 flex flex-col border-r border-gray-200/50 dark:border-white/5 transition-colors"
      style={{ overflow: "hidden" }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-gray-200/50 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">PhishDeep</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-2 pb-2">Menu</p>
        {menuLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-gray-400 dark:text-gray-500"}`} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-2 pb-2">Lainnya</p>
          {otherLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-gray-400 dark:text-gray-500"}`} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-5 space-y-2 border-t border-gray-200/50 dark:border-white/5 pt-3">
        {/* Free plan card */}
        <div className="bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/8 rounded-2xl px-3.5 py-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">100% Gratis</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
            Limit <span className="font-semibold text-gray-800 dark:text-gray-300">10 scan / hari</span>. Tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 text-gray-400 shrink-0" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
