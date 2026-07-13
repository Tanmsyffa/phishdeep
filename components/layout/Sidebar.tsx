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
      className="w-56 xl:w-60 bg-white/80 dark:bg-[#111111]/90 backdrop-blur-2xl text-gray-900 dark:text-gray-100 h-screen sticky top-0 flex flex-col border-r border-gray-100 dark:border-white/6 transition-colors"
      style={{ overflow: "hidden" }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[9px] bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">PhishDeep</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-2 pb-1.5">Menu</p>
        {menuLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-95 ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/15"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "text-white" : "text-gray-400 dark:text-gray-500"}`} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}

        <div className="pt-3">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-2 pb-1.5">Lainnya</p>
          {otherLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-95 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/15"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "text-white" : "text-gray-400 dark:text-gray-500"}`} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-white/6 pt-3">
        {/* Free plan card */}
        <div className="bg-blue-50/80 dark:bg-blue-500/[0.08] rounded-xl px-3 py-2.5 mb-2">
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">100% Gratis</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-snug">
            Limit <span className="font-semibold text-gray-700 dark:text-gray-400">10 scan / hari</span>. Tanpa biaya.
          </p>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 transition-all duration-150 active:scale-95"
          >
            <LogOut className="w-[15px] h-[15px] text-gray-400 shrink-0" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
