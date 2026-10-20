-- Migrasi US-31: tabel kategori. Aman dijalankan ulang.
-- Cara pakai: Supabase > SQL Editor > New query > tempel > Run.
-- Kategori yang sudah dipakai produk otomatis dimasukkan ke tabel ini.
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null check (length(trim(nama)) between 1 and 40),
  created_at timestamptz not null default now()
);

-- Nama kategori unik tanpa membedakan huruf besar atau kecil.
create unique index if not exists kategori_nama_unik on public.kategori (lower(nama));

alter table public.kategori enable row level security;

drop policy if exists "admin_baca_kategori" on public.kategori;
drop policy if exists "admin_tambah_kategori" on public.kategori;
drop policy if exists "admin_ubah_kategori" on public.kategori;
drop policy if exists "admin_hapus_kategori" on public.kategori;

create policy "admin_baca_kategori" on public.kategori
  for select to authenticated using (true);

create policy "admin_tambah_kategori" on public.kategori
  for insert to authenticated with check (true);

create policy "admin_ubah_kategori" on public.kategori
  for update to authenticated using (true) with check (true);

create policy "admin_hapus_kategori" on public.kategori
  for delete to authenticated using (true);

-- Isi awal dari kategori yang sudah dipakai produk.
insert into public.kategori (nama)
select distinct trim(kategori) from public.produk
where kategori is not null and trim(kategori) <> ''
on conflict do nothing;
