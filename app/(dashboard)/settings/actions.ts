'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Tidak terautentikasi." }

  const fullName = formData.get('full_name') as string
  const avatarUrl = formData.get('avatar_url') as string

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Nama minimal 2 karakter." }
  }

  const { error } = await supabase.auth.updateUser({
    data: { 
      full_name: fullName.trim(),
      avatar_url: avatarUrl ? avatarUrl.trim() : user.user_metadata?.avatar_url
    }
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: "Profil berhasil diperbarui." }
}

