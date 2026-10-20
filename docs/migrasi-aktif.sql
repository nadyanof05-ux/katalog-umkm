-- Migrasi US-32: tambah kolom aktif ke tabel produk yang sudah ada.
-- Cara pakai: Supabase > SQL Editor > New query > tempel > Run. Aman dijalankan ulang.
-- Semua produk yang sudah ada otomatis aktif (tampil di katalog).
alter table public.produk
  add column if not exists aktif boolean not null default true;
