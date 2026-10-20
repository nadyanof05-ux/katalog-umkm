// US-18: satu produk bisa punya beberapa foto. Skema tidak diubah: kolom `foto_url`
// menyimpan satu link per baris. Produk lama dengan satu link tetap berlaku.
export const FOTO_MAKS = 6;

export function daftarFoto(fotoUrl) {
  return (fotoUrl ?? "")
    .split(/\r?\n/)
    .map((baris) => baris.trim())
    .filter(Boolean);
}

export function fotoUtama(fotoUrl) {
  return daftarFoto(fotoUrl)[0] ?? "";
}

// US-29: aturan unggah foto, dipakai di browser (pesan cepat) dan di server (yang menentukan).
export const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const UKURAN_FOTO_MAKS = 2 * 1024 * 1024; // per file
export const UKURAN_UNGGAH_MAKS = 4 * 1024 * 1024; // total satu kali simpan (batas body Vercel 4,5 MB)

// Mengembalikan pesan error, atau null kalau file boleh diunggah.
export function periksaFile(file) {
  if (!TIPE_FOTO.includes(file.type)) {
    return `"${file.name}" bukan gambar JPG, PNG, atau WebP.`;
  }
  if (file.size > UKURAN_FOTO_MAKS) {
    return `"${file.name}" terlalu besar. Maksimal ${UKURAN_FOTO_MAKS / 1024 / 1024} MB per foto.`;
  }
  return null;
}
