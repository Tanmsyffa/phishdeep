'use server'
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteScan(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.from('scans').delete().eq('id', id).eq('user_id', user.id).select()
  console.log("DeleteScan DB Response:", { data, error })
  
  if (error) {
    console.error("DeleteScan Error:", error.message)
    throw new Error(error.message)
  }

  // If no error but no rows deleted, it might be RLS preventing deletion
  if (!data || data.length === 0) {
    throw new Error("Data tidak ditemukan atau akses ditolak oleh RLS.")
  }

  revalidatePath('/history')
  revalidatePath('/dashboard')
}
