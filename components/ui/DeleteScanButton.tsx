'use client'

import { Trash2 } from "lucide-react"
import { deleteScan } from "@/app/(dashboard)/history/actions"
import { useState } from "react"

export default function DeleteScanButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <button 
      disabled={isDeleting}
      onClick={async () => {
        if (confirm('Hapus riwayat ini secara permanen?')) {
          setIsDeleting(true)
          try {
            await deleteScan(id)
          } catch (e) {
            alert('Gagal menghapus data')
            setIsDeleting(false)
          }
        }
      }} 
      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Hapus riwayat"
    >
      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  )
}
