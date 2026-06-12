'use client'

import { Trash2, X, Check, Loader2 } from "lucide-react"
import { deleteScan } from "@/app/(dashboard)/history/actions"
import { useState } from "react"

export default function DeleteScanButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleDelete = async () => {
    setIsDeleting(true)
    setErrorMsg("")
    try {
      await deleteScan(id)
    } catch (e) {
      setErrorMsg("Gagal dihapus")
      setIsDeleting(false)
      setTimeout(() => setErrorMsg(""), 3000)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 bg-red-50 rounded-lg p-1 border border-red-100">
        <button
          disabled={isDeleting}
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Yakin?
        </button>
        <button
          disabled={isDeleting}
          onClick={() => setConfirming(false)}
          className="p-1 text-gray-500 hover:text-gray-700 bg-white rounded transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex items-center">
      <button 
        onClick={() => setConfirming(true)} 
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        title="Hapus riwayat"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {errorMsg && (
        <span className="absolute right-full mr-2 text-[10px] font-medium text-red-600 whitespace-nowrap bg-red-50 px-1.5 py-0.5 rounded">
          {errorMsg}
        </span>
      )}
    </div>
  )
}
