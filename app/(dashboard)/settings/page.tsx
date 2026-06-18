"use client";

import { useState, useTransition, useEffect } from "react";
import { updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, User, Lock, ShieldCheck, Image as ImageIcon, Palette } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border mt-4 ${
      type === "success"
        ? "bg-green-50 dark:bg-green-500/20 text-green-700 border-green-200"
        : "bg-red-50 dark:bg-red-500/20 text-red-700 border-red-200"
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
      }
    });
  };



  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Pengaturan</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Kelola profil dan keamanan akun Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mb-5">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Informasi Profil</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-4 mb-2">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl shrink-0 border border-blue-200 dark:border-blue-800">
                {(currentName || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> URL Foto Profil
              </label>
              <input
                id="avatar_url"
                name="avatar_url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                defaultValue={currentAvatar}
                key={`avatar-${currentAvatar}`} // force re-render when avatar loads
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Gunakan URL gambar publik atau biarkan kosong. Profil Google terintegrasi otomatis.</p>
            </div>
          </div>

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
              key={`name-${currentName}`} // force re-render when name loads
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          {profileMsg && <Toast message={profileMsg.text} type={profileMsg.type} />}
          <div className="pt-2">
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
