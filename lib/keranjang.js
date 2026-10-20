import { useSyncExternalStore } from "react";

// US-21: keranjang disimpan di browser (localStorage) sebagai daftar { id, jumlah }.
// Harga dan stok tidak disimpan di sini; halaman keranjang mengambil data terbaru dari server.
const KUNCI = "keranjang-umkm";
export const JUMLAH_MAKS = 99;

const KOSONG = [];
const pendengar = new Set();
let cacheMentah = null;
let cacheNilai = KOSONG;

function urai(mentah) {
  try {
    const data = JSON.parse(mentah);
    if (!Array.isArray(data)) return KOSONG;
    const dilihat = new Set();
    const hasil = [];
    for (const item of data) {
      const id = Number(item?.id);
      const jumlah = Number(item?.jumlah);
      if (!Number.isInteger(id) || id <= 0 || dilihat.has(id)) continue;
      if (!Number.isInteger(jumlah) || jumlah < 1) continue;
      dilihat.add(id);
      hasil.push({ id, jumlah: Math.min(jumlah, JUMLAH_MAKS) });
    }
    return hasil;
  } catch {
    return KOSONG;
  }
}

// Mengembalikan array yang sama selama isinya tidak berubah (syarat useSyncExternalStore).
function baca() {
  let mentah = cacheMentah;
  try {
    mentah = window.localStorage.getItem(KUNCI);
  } catch {
    // localStorage tidak tersedia: pakai salinan di memori.
    return cacheNilai;
  }
  if (mentah !== cacheMentah) {
    cacheMentah = mentah;
    cacheNilai = mentah ? urai(mentah) : KOSONG;
  }
  return cacheNilai;
}

function tulis(daftar) {
  cacheNilai = daftar.length ? daftar : KOSONG;
  cacheMentah = daftar.length ? JSON.stringify(daftar) : null;
  try {
    if (cacheMentah === null) window.localStorage.removeItem(KUNCI);
    else window.localStorage.setItem(KUNCI, cacheMentah);
  } catch {
    // Abaikan: keranjang tetap ada di memori selama halaman terbuka.
  }
  pendengar.forEach((fn) => fn());
}

function langganan(fn) {
  pendengar.add(fn);
  const saatStorage = (e) => {
    if (e.key === KUNCI || e.key === null) fn();
  };
  window.addEventListener("storage", saatStorage);
  return () => {
    pendengar.delete(fn);
    window.removeEventListener("storage", saatStorage);
  };
}

export function useKeranjang() {
  return useSyncExternalStore(langganan, baca, () => KOSONG);
}

const batasi = (jumlah) => Math.min(JUMLAH_MAKS, Math.max(1, Math.floor(jumlah) || 1));

export function tambahKeKeranjang(id, jumlah = 1) {
  const daftar = baca();
  const ada = daftar.find((item) => item.id === id);
  tulis(
    ada
      ? daftar.map((item) =>
          item.id === id ? { ...item, jumlah: batasi(item.jumlah + jumlah) } : item,
        )
      : [...daftar, { id, jumlah: batasi(jumlah) }],
  );
}

export function ubahJumlahKeranjang(id, jumlah) {
  tulis(baca().map((item) => (item.id === id ? { ...item, jumlah: batasi(jumlah) } : item)));
}

export function hapusDariKeranjang(id) {
  tulis(baca().filter((item) => item.id !== id));
}
