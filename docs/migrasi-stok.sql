-- Migrasi US-19: tambah kolom stok ke tabel produk yang sudah ada.
-- Cara pakai: Supabase > SQL Editor > New query > tempel > Run. Aman dijalankan ulang.
-- Produk yang sudah ada otomatis bernilai stok 1 (tersedia). Ubah lewat halaman admin.
alter table public.produk
  add column if not exists stok integer not null default 1 check (stok >= 0);
