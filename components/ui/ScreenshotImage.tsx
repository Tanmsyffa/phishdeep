"use client";

export default function ScreenshotImage({ src }: { src: string }) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Screenshot visual situs target"
        className="w-full rounded-xl border border-gray-200 shadow-inner object-cover max-h-[360px] peer"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = "none";
          const fallback = img.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        style={{ display: "none" }}
        className="flex-col items-center justify-center text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl"
      >
        <p className="mb-1">📷 Screenshot tidak tersedia</p>
        <p className="text-xs">Target mungkin memblokir akses bot atau sudah di-takedown.</p>
      </div>
    </div>
  );
}
