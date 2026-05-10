# 📓 SevNotes — Aplikasi Catatan Pribadi

Aplikasi catatan modern dengan notebook, lampiran file/gambar, dan checklist tugas. Dibangun dengan Next.js 14, Supabase, dan di-deploy ke Vercel.

## ✨ Fitur

- **🔐 Autentikasi** — Login & register dengan email/password
- **📓 Notebook** — Kelompokkan catatan dalam folder/notebook dengan ikon & warna
- **📝 Catatan** — Tulis catatan panjang dengan auto-save otomatis
- **📎 Lampiran** — Upload gambar, PDF, dan file lainnya ke setiap catatan
- **✅ Checklist Tugas** — Kelola tugas dengan prioritas, tenggat, dan status selesai
- **📱 Responsif** — Tampilan mobile-friendly

---

## 🚀 Setup & Deploy

### 1. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com) dan buat project baru
2. Masuk ke **SQL Editor** dan jalankan seluruh isi file `supabase-schema.sql`
3. Pergi ke **Settings → API** dan salin:
   - `Project URL`
   - `anon public key`

### 2. Setup Local

```bash
# Clone / extract project
cd SevNotes

# Install dependencies
npm install

# Buat file .env.local
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
NEXT_PUBLIC_STORAGE_BUCKET=SevNotes-files
```

```bash
# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 3. Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → Import dari GitHub
3. Tambahkan **Environment Variables** (sama seperti `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy** 🚀

---

## 🗂️ Struktur Project

```
SevNotes/
├── app/
│   ├── auth/page.tsx          # Halaman login & register
│   ├── dashboard/
│   │   ├── layout.tsx         # Layout dengan sidebar
│   │   ├── page.tsx           # Beranda dashboard
│   │   ├── tasks/page.tsx     # Halaman tugas
│   │   └── notebook/
│   │       └── [notebookId]/
│   │           ├── page.tsx   # Daftar catatan
│   │           └── note/[noteId]/page.tsx  # Editor catatan
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── notes/
│   │   ├── CreateNotebookModal.tsx
│   │   ├── NotebookView.tsx
│   │   └── NoteEditor.tsx
│   └── tasks/
│       └── TasksView.tsx
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser client
│       └── server.ts          # Server client
├── types/index.ts
├── middleware.ts              # Auth middleware
└── supabase-schema.sql        # Database schema
```

---

## 🗄️ Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `notebooks` | Folder/kelompok catatan |
| `notes` | Catatan dalam notebook |
| `note_attachments` | File/gambar lampiran |
| `tasks` | Checklist tugas |

Semua data dilindungi dengan **Row Level Security (RLS)** — setiap user hanya bisa melihat datanya sendiri.

---

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Font**: Playfair Display + Lato
