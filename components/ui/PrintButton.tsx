'use client'

import { Download } from "lucide-react"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex-1 bg-primary-600 text-white font-semibold py-3 px-5 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
    >
      <Download className="w-4 h-4" /> Download Laporan PDF
    </button>
  )
}
