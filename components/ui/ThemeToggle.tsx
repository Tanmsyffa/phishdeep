"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 overflow-hidden border border-gray-200 dark:border-slate-700
        ${isDark ? 'bg-slate-800' : 'bg-gray-100'}
      `}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      
      {/* Background Icons (static) */}
      <div className="absolute inset-0 flex justify-between px-1.5 items-center w-full pointer-events-none">
        <Moon className="w-3.5 h-3.5 text-slate-400" />
        <Sun className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* The thumb (sliding circle) */}
      <span
        className={`z-10 flex items-center justify-center inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-[26px]' : 'translate-x-1'}
        `}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-slate-800" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}
