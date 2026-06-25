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
  X,
  Search
} from "lucide-react";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard",    icon: <Home className="w-4 h-4" />,       active: isActive('/dashboard') && !pathname.includes('/scan') },
    { href: "/search",    label: "Cari ID Scan", icon: <Search className="w-4 h-4" />,     active: isActive('/search') },
    { href: "/scan",      label: "Scan Baru",    icon: <ScanLine className="w-4 h-4" />,   active: pathname.includes('/scan') },
    { href: "/history",   label: "Riwayat Scan", icon: <History className="w-4 h-4" />,    active: isActive('/history') },
    { href: "/reports",   label: "Laporan PDF",  icon: <FileText className="w-4 h-4" />,   active: isActive('/reports') },
    { href: "/settings",  label: "Pengaturan",   icon: <Settings className="w-4 h-4" />,   active: isActive('/settings') },
    { href: "/help",      label: "Bantuan",      icon: <HelpCircle className="w-4 h-4" />, active: isActive('/help') },
  ];

  return (
    <aside className="w-64 bg-ios-bg/80 dark:bg-ios-cardDark/80 backdrop-blur-2xl text-gray-900 dark:text-gray-100 h-full md:h-screen sticky top-0 flex flex-col border-r border-gray-200/50 dark:border-white/5 transition-colors supports-[backdrop-filter]:bg-ios-bg/60 dark:supports-[backdrop-filter]:bg-ios-cardDark/60" style={{ overflow: 'hidden' }}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">PhishDeep</span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 pb-2">Menu</p>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 active:scale-95 ${
              link.active
                ? 'bg-primary-600 text-white font-semibold shadow-md shadow-primary-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5'
            }`}
          >
            <span className={link.active ? 'text-white' : 'text-gray-400'}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-gray-200/50 dark:border-white/5 space-y-3">
        {/* Promo card */}
        <div className="bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl px-3.5 py-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">100% Gratis</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">Limit <span className="text-gray-800 dark:text-gray-300 font-medium">10 scan / hari</span>. Tanpa biaya tersembunyi.</p>
        </div>



        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-left"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
