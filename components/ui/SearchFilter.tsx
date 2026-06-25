"use client";

import { Search, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchFilter({ 
  showType = true, 
  showStatus = true 
}: { 
  showType?: boolean; 
  showStatus?: boolean; 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  // Sync state with URL params if they change externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setType(searchParams.get('type') || 'all');
    setStatus(searchParams.get('status') || 'all');
  }, [searchParams]);

  const handleUpdate = (newQuery: string, newType: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newType !== 'all') params.set('type', newType);
    if (newStatus !== 'all') params.set('status', newStatus);
    
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari target URL atau nama..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-gray-900 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
             if (e.key === 'Enter') handleUpdate(query, type, status);
          }}
          onBlur={() => handleUpdate(query, type, status)}
        />
      </div>
      
      <div className="flex flex-row gap-3 w-full sm:w-auto">
        {showType && (
          <div className="relative flex-1 sm:w-[140px]">
            <select 
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                handleUpdate(query, e.target.value, status);
              }}
              className="w-full appearance-none border border-gray-200/60 dark:border-white/10 rounded-full pl-4 pr-8 py-2.5 text-sm bg-gray-50/80 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer backdrop-blur-xl font-medium"
            >
              <option value="all">Semua Jenis</option>
              <option value="Link">Link</option>
              <option value="APK">APK</option>
              <option value="Dokumen">Dokumen</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        )}
        
        {showStatus && (
          <div className="relative flex-1 sm:w-[140px]">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleUpdate(query, type, e.target.value);
              }}
              className="w-full appearance-none border border-gray-200/60 dark:border-white/10 rounded-full pl-4 pr-8 py-2.5 text-sm bg-gray-50/80 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer backdrop-blur-xl font-medium"
            >
              <option value="all">Semua Hasil</option>
              <option value="Aman">Aman</option>
              <option value="Mencurigakan">Mencurigakan</option>
              <option value="Berbahaya">Berbahaya</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
