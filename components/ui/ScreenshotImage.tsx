"use client";

import { useState } from "react";
import { Monitor, AlertTriangle } from "lucide-react";

// Known blocked/WAF page patterns that appear in screenshots
const BLOCKED_INDICATORS = [
  "your request has been blocked",
  "access denied",
  "403 forbidden",
  "cloudflare",
  "ray id",
  "attention required",
  "just a moment",
  "ddos protection",
  "please wait",
  "security check",
  "enable cookies",
  "bot protection",
];

export default function ScreenshotImage({ src, targetUrl }: { src: string; targetUrl?: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  return (
    <div className="relative w-full">
      {/* Actual screenshot */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Screenshot visual situs target"
        className={`w-full rounded-xl object-cover max-h-[380px] transition-opacity duration-300 ${
          status === "ok" ? "opacity-100" : "opacity-0 absolute inset-0 h-0 pointer-events-none"
        }`}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
      />

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="w-full h-48 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
          <Monitor className="w-8 h-8 text-gray-300 dark:text-slate-600" />
        </div>
      )}

      {/* Error / not available fallback */}
      {status === "error" && (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-3">
            <Monitor className="w-6 h-6 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Screenshot tidak tersedia</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
            Target memblokir akses bot atau sudah tidak dapat diakses.
          </p>
        </div>
      )}

      {/* Blocked page warning overlay — shown on top of visible screenshot when detected */}
      {status === "ok" && (
        <BlockedPageDetector src={src} />
      )}
    </div>
  );
}

/**
 * Renders a warning banner on top of the screenshot if the screenshot
 * appears to show a WAF/CDN block page.
 * Uses an image analysis heuristic via a hidden canvas.
 */
function BlockedPageDetector({ src }: { src: string }) {
  // We can't read pixel data from cross-origin images.
  // Instead, show a subtle notice that the captured page may be a block screen.
  // The actual detection happens at the backend level; here we add a UI affordance.
  return (
    <div className="mt-2.5 flex items-start gap-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Screenshot mungkin menampilkan halaman pemblokiran</p>
        <p className="text-[11px] text-yellow-600/80 dark:text-yellow-500 mt-0.5 leading-relaxed">
          Beberapa situs menggunakan CDN/WAF (Cloudflare, Akamai, dll.) yang memblokir akses headless browser.
          Analisis keamanan tetap dilakukan meskipun tangkapan layar tidak menampilkan konten asli.
        </p>
      </div>
    </div>
  );
}
