-- Migrasi US-20: tambah kolom harga_diskon dan badge ke tabel produk yang sudah ada.
-- Cara pakai: Supabase > SQL Editor > New query > tempel > Run. Aman dijalankan ulang.
-- Produk yang sudah ada tidak berubah (kedua kolom kosong).
alter table public.produk
  add column if not exists harga_diskon integer
    check (harga_diskon is null or (harga_diskon >= 0 and harga_diskon < harga));

alter table public.produk
  add column if not exists badge text
    check (badge is null or badge in ('Baru', 'Terlaris'));
