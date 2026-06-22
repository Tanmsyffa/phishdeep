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

export default function SettingsPage() {
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [currentName, setCurrentName] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setCurrentName(user.user_metadata.full_name);
      }
      if (user?.user_metadata?.avatar_url) {
        setCurrentAvatar(user.user_metadata.avatar_url);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProfileMsg(null);
    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setProfileMsg({ text: result.error, type: "error" });
      } else if (result?.success) {
        setProfileMsg({ text: result.success, type: "success" });
        // Refresh sesi klien untuk mendapatkan metadata user terbaru dari Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.refreshSession().then(
          async () => supabase.auth.getUser()
        );
        const freshAvatar = user?.user_metadata?.avatar_url;
        if (freshAvatar) {
          // Tambahkan cache-buster agar browser tidak menampilkan versi lama
          setCurrentAvatar(`${freshAvatar.split('?')[0]}?v=${Date.now()}`);
        } else if (result.avatarUrl) {
          setCurrentAvatar(result.avatarUrl);
        }
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Pengaturan</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kelola profil dan keamanan akun Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mb-5">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Informasi Profil</h2>
        </div>
        <form ref={formRef} onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar Preview */}
            <div className="relative shrink-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white dark:border-slate-800">
                  {(currentName || 'U')[0].toUpperCase()}
                </div>
              )}
              {/* Camera button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors border-2 border-white dark:border-slate-800"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

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
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Pilih Foto
              </button>
              {previewUrl && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">✓ Foto baru siap diupload</p>
              )}
            </div>

            {/* Hidden file input - accepts camera and gallery on mobile */}
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
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {profileMsg && <Toast message={profileMsg.text} type={profileMsg.type} />}
          <div>
            <button
              type="submit"
              disabled={isPendingProfile}
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-primary-700 transition-colors text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPendingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPendingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Theme Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
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
