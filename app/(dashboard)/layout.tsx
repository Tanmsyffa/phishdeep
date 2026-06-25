"use client";

import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import LiveNotifications from "@/components/ui/LiveNotifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-ios-bg dark:bg-ios-bgDark flex-row relative print:h-auto print:overflow-visible print:bg-white transition-colors duration-300">
      <LiveNotifications />

      {/* Sidebar — Desktop only (lg+) */}
      <div className="hidden lg:flex print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative z-0 print:overflow-visible print:h-auto print:block">
        {/* Extra bottom padding on mobile so content isn't hidden behind BottomNav */}
        <div className="p-4 md:p-8 pb-28 lg:pb-8 print:p-0">
          {children}
        </div>
      </main>

      {/* Bottom Nav — Mobile & Tablet only (< lg) */}
      <BottomNav />
    </div>
  );
}
