'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Tidak terautentikasi." }

  const fullName = formData.get('full_name') as string
  const avatarFile = formData.get('avatar_file') as File | null

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Nama minimal 2 karakter." }
  }

  let avatarUrl = user.user_metadata?.avatar_url ?? ''

  // Upload new avatar if provided
  if (avatarFile && avatarFile.size > 0) {
    let ext = avatarFile.name.includes('.') ? avatarFile.name.split('.').pop()?.toLowerCase() : null
    if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      ext = avatarFile.type.split('/').pop() || 'jpg'
    }
    const filePath = `avatars/${user.id}.${ext}`
    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('scans')
      .upload(filePath, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      })

    if (uploadError) {
      return { error: `Gagal upload foto: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('scans')
      .getPublicUrl(filePath)

    avatarUrl = `${publicUrl}?v=${Date.now()}`
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
    }
  })

  if (error) {
    return { error: `Gagal update profil: ${error.message}` }
  }

  return { success: "Profil berhasil diperbarui.", avatarUrl }
}
