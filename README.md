# 🛡️ PhishDeep

**PhishDeep** adalah platform cerdas untuk mendeteksi ancaman siber seperti *phishing* dan *malware* pada tautan (link), aplikasi Android (APK), serta dokumen. Tidak hanya memberikan peringatan, PhishDeep menyertakan laporan forensik dengan **bukti visual nyata** (tangkapan layar area berbahaya) yang siap digunakan.

## ✨ Fitur Utama
- 🔗 **Deteksi Link Phishing**: Pindai URL mencurigakan dan dapatkan screenshot dari form login palsu yang ditandai dengan kotak merah.
- 📱 **Pemindaian APK Malware**: Periksa aplikasi Android untuk mendeteksi potensi virus atau malware tersembunyi.
- 📄 **Analisis Dokumen Berbahaya**: Cek file PDF atau dokumen kantor dari skrip berbahaya.
- 📊 **Laporan PDF Forensik**: Unduh laporan lengkap hasil pemindaian dalam format PDF untuk keperluan bukti atau investigasi.
- ⚡ **Real-Time Dashboard**: Pantau seluruh riwayat pemindaian dan tingkat keamanan Anda dari satu dashboard terpadu.

## 🚀 Teknologi yang Digunakan
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend (API)**: Python (Flask), Playwright (untuk rendering bukti visual), BeautifulSoup
- **Database & Auth**: Supabase (PostgreSQL, Authentication)
- **Deployment**: Vercel

## 💻 Panduan Instalasi Lokal

### Prasyarat
- Node.js (v18+)
- Python (v3.10+)
- Akun Supabase

### 1. Kloning Repositori
```bash
git clone https://github.com/username-anda/phishdeep.git
cd phishdeep
```

### 2. Setup Frontend (Next.js)
Install dependensi:
```bash
npm install
```

Buat file `.env.local` di root folder dan masukkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[ID_PROJECT_ANDA].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[KUNCI_ANON_ANDA]
```

### 3. Setup Backend (Python API)
Buat virtual environment dan install dependensi Python:
```bash
python -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install  # Untuk mengunduh browser bawaan Playwright
```

### 4. Menjalankan Aplikasi
Buka dua terminal terpisah.

**Terminal 1 (Frontend):**
```bash
npm run dev
```
*(Aplikasi akan berjalan di http://localhost:3000)*

**Terminal 2 (Backend Python):**
```bash
python api/index.py
```
*(API akan berjalan di http://localhost:5328)*

## 🤝 Berkontribusi
Kami menyambut baik segala bentuk kontribusi! Silakan buat *Issue* atau kirimkan *Pull Request* jika Anda memiliki ide fitur baru atau menemukan *bug*.

## 📄 Lisensi
Hak Cipta © 2026 PhishDeep. Seluruh hak dilindungi.
