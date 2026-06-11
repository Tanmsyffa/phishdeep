'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Tidak terautentikasi." }

  const fullName = formData.get('full_name') as string
  if (!fullName || fullName.trim().length < 2) {
    return { error: "Nama minimal 2 karakter." }
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName.trim() }
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: "Profil berhasil diperbarui." }
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Tidak terautentikasi." }

  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password minimal 6 karakter." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }

  return { success: "Password berhasil diperbarui." }
}
