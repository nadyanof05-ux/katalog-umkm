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
