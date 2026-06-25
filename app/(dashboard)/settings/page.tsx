"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, User, ShieldCheck, Camera, Palette } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border mt-4 ${
      type === "success"
        ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
        : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
    }`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

// Avatar component dengan fallback ke inisial jika gambar gagal load
function AvatarDisplay({ url, name, onCameraClick }: { url: string | null; name: string; onCameraClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  // Reset error state setiap kali URL berubah (upload foto baru)
  useEffect(() => {
    setImgError(false);
  }, [url]);

  return (
    <div className="relative shrink-0">
      {url && !imgError ? (
        <img
          src={url}
          alt="Foto Profil"
          onError={() => setImgError(true)}
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-white\/10 shadow-lg"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white dark:border-white\/10">
          {(name || 'U')[0].toUpperCase()}
        </div>
      )}
      <button
        type="button"
        onClick={onCameraClick}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors border-2 border-white dark:border-white\/10"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [currentName, setCurrentName] = useState("");
  // URL yang ditampilkan — bisa preview base64 atau URL Supabase
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setCurrentName(user.user_metadata.full_name);
      if (user?.user_metadata?.avatar_url) {
        // Tambahkan cache-buster pada load awal agar versi terbaru selalu ditampilkan
        const base = user.user_metadata.avatar_url.split('?')[0];
        setDisplayUrl(`${base}?v=${Date.now()}`);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Tampilkan preview base64 secara instan
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setDisplayUrl(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProfileMsg(null);

    startProfileTransition(async () => {
      const result = await updateProfile(formData);

      if (result?.error) {
        setProfileMsg({ text: result.error, type: "error" });
        return;
      }

      if (result?.success) {
        setProfileMsg({ text: result.success, type: "success" });

        // Jika ada URL baru dari server (foto baru di-upload), gunakan langsung
        if (result.avatarUrl) {
          const baseUrl = result.avatarUrl.split('?')[0];
          setDisplayUrl(`${baseUrl}?v=${Date.now()}`);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Pengaturan</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kelola profil dan keamanan akun Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-ios-card/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-5">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200/50 dark:border-white/10 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Informasi Profil</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <AvatarDisplay
              url={displayUrl}
              name={currentName}
              onCameraClick={() => fileInputRef.current?.click()}
            />

            {/* Upload instruction */}
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Foto Profil</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                Klik ikon kamera atau tombol di bawah untuk memilih foto dari galeri atau mengambil dari kamera.
                Format: JPG, PNG, WEBP. Maks: 5 MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                Pilih Foto
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="avatar_file"
              name="avatar_file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="Nama Anda"
              defaultValue={currentName}
              key={`name-${currentName}`}
              className="w-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>

          {profileMsg && <Toast message={profileMsg.text} type={profileMsg.type} />}
          <div>
            <button
              type="submit"
              disabled={isPendingProfile}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-full hover:bg-blue-700 transition-colors text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {isPendingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPendingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Theme Card */}
      <div className="bg-ios-card/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200/50 dark:border-white/10 flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Tampilan & Tema</h2>
        </div>
        <div className="p-5 sm:p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5">Mode Gelap / Terang</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Sesuaikan tema antarmuka sesuai kenyamanan mata Anda.</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
