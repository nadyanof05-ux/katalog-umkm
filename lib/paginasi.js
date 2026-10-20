// Dipakai katalog publik (US-16) dan daftar admin (US-33).

// Escape karakter khusus pola LIKE supaya "%" dan "_" dicari apa adanya.
export const escapeLike = (teks) => teks.replace(/[\\%_]/g, "\\$&");

// Nomor halaman yang ditampilkan: awal, akhir, dan sekitar halaman aktif ("..." untuk celah).
export function daftarNomorHalaman(aktif, total) {
  const nomor = new Set([1, total, aktif - 1, aktif, aktif + 1]);
  const urut = [...nomor].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const hasil = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("...");
    hasil.push(n);
  });
  return hasil;
}
