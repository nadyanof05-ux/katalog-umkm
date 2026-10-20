# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** (tempel prompt yang kamu pakai di sini)

**Hasil:** Halaman `/` menampilkan produk dari tabel `produk` di Supabase lewat server.

**Perbaikan:**

## US-02 Detail produk

**Prompt:** (tempel prompt yang kamu pakai di sini)

**Hasil:** Halaman `/produk/[id]` menampilkan detail produk dari database.

**Perbaikan:**

## US-03 Pesan via WhatsApp

**Prompt:** (tempel prompt yang kamu pakai di sini)

**Hasil:** Tombol pesan membuka WhatsApp toko dengan pesan berisi produk yang dipilih.

**Perbaikan:**

## US-04 Login admin

**Prompt:** (tempel prompt yang kamu pakai di sini)

**Hasil:** Form `/admin/login` masuk dengan Supabase Auth lewat Server Action; sesi disimpan di cookie.

**Perbaikan:**

## US-05 Ganti password

**Prompt:** (tempel prompt yang kamu pakai di sini)

**Hasil:** Halaman `/admin/password` mengganti password lewat Server Action yang memeriksa login dulu.

**Perbaikan:**

## US-06 Proteksi halaman admin

**Prompt:** Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:** `proxy.js` memeriksa `supabase.auth.getUser()` untuk `/admin` dan turunannya, lalu mengalihkan ke `/admin/login` jika belum login. `gantiPassword` sudah memeriksa login di server. CatatanBelumAktif dihapus dari `/admin`.

**Perbaikan:** Belum ada. Action tambah, ubah, dan hapus produk (US-08 sampai US-10) nanti harus memeriksa login juga.

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.
