-- =============================================
-- SevNotes - Database Schema
-- Jalankan script ini di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABEL: notebooks (Buku catatan / folder)
-- =============================================
create table notebooks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  color text default '#87a878',
  icon text default '📓',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TABEL: notes (Catatan dalam notebook)
-- =============================================
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  notebook_id uuid references notebooks(id) on delete cascade not null,
  title text not null,
  content text default '',
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TABEL: note_attachments (File/gambar lampiran)
-- =============================================
create table note_attachments (
  id uuid default uuid_generate_v4() primary key,
  note_id uuid references notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz default now()
);

-- =============================================
-- TABEL: tasks (Checklist tugas)
-- =============================================
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  notebook_id uuid references notebooks(id) on delete set null,
  title text not null,
  is_completed boolean default false,
  due_date date,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
alter table notebooks enable row level security;
alter table notes enable row level security;
alter table note_attachments enable row level security;
alter table tasks enable row level security;

-- Notebooks policies
create policy "Users can view own notebooks"
  on notebooks for select using (auth.uid() = user_id);
create policy "Users can insert own notebooks"
  on notebooks for insert with check (auth.uid() = user_id);
create policy "Users can update own notebooks"
  on notebooks for update using (auth.uid() = user_id);
create policy "Users can delete own notebooks"
  on notebooks for delete using (auth.uid() = user_id);

-- Notes policies
create policy "Users can view own notes"
  on notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes"
  on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes"
  on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes"
  on notes for delete using (auth.uid() = user_id);

-- Note attachments policies
create policy "Users can view own attachments"
  on note_attachments for select using (auth.uid() = user_id);
create policy "Users can insert own attachments"
  on note_attachments for insert with check (auth.uid() = user_id);
create policy "Users can delete own attachments"
  on note_attachments for delete using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Buat bucket "SevNotes-files" di Supabase Storage Dashboard
-- Lalu jalankan policy berikut:

insert into storage.buckets (id, name, public) values ('SevNotes-files', 'SevNotes-files', false);

create policy "Users can upload own files"
  on storage.objects for insert
  with check (bucket_id = 'SevNotes-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own files"
  on storage.objects for select
  using (bucket_id = 'SevNotes-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'SevNotes-files' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- FUNCTIONS: auto update updated_at
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notebooks_updated_at before update on notebooks
  for each row execute procedure update_updated_at();
create trigger notes_updated_at before update on notes
  for each row execute procedure update_updated_at();
create trigger tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at();
