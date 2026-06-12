'use server'
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteScan(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from('scans').update({ status: 'deleted', results_json: {} }).eq('id', id).eq('user_id', user.id)
  
  if (error) throw new Error(error.message)

  revalidatePath('/history')
  revalidatePath('/dashboard')
}
