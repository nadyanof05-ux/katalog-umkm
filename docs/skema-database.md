# Skema Database

## Tabel `produk`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Nomor unik, dibuat otomatis |
| `nama` | text | Nama produk, wajib diisi |
| `harga` | integer | Harga dalam rupiah, tidak boleh negatif |
| `deskripsi` | text | Penjelasan produk |
| `foto_url` | text | Link gambar produk |
| `kategori` | text | Kelompok produk, misalnya "Camilan" |
| `stok` | integer | Jumlah stok (US-19). 0 berarti habis, bawaan 1 |
| `aktif` | boolean | Status tampil (US-32). `false` = disembunyikan dari katalog publik, bawaan `true` |
| `harga_diskon` | integer | Harga setelah diskon (US-20). Kosong = tidak diskon; harus lebih kecil dari `harga` |
| `badge` | text | Label produk (US-20): kosong, "Baru", atau "Terlaris" |
| `created_at` | timestamptz | Waktu dibuat, otomatis |

## Tabel `kategori` (US-31)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Nomor unik, dibuat otomatis |
| `nama` | text | Nama kategori, unik tanpa membedakan huruf besar atau kecil, 1 sampai 40 karakter |
| `created_at` | timestamptz | Waktu dibuat, otomatis |

`produk.kategori` tetap berisi nama kategori. RLS aktif: hanya admin yang login yang boleh membaca dan mengubah.

## Aturan akses (RLS)

Row Level Security aktif di tabel `produk`.

| Siapa | Baca | Tambah | Ubah | Hapus |
| --- | --- | --- | --- | --- |
| Publik (tanpa login) | Ditolak | Ditolak | Ditolak | Ditolak |
| Admin yang login | Boleh | Boleh | Boleh | Boleh |

Pengunjung tetap bisa melihat katalog karena data dibaca oleh server memakai kunci rahasia, bukan langsung dari browser.

Skrip lengkap ada di `docs/schema.sql`.
