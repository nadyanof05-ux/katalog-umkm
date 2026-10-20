"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

const JUMLAH_MAKS = 99;

// US-12: pengunjung memilih jumlah; jumlah dan total ikut tertulis di pesan WhatsApp.
export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  if (!produk) return null;

  const atur = (nilai) => setJumlah(Math.min(JUMLAH_MAKS, Math.max(1, nilai)));

  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const total = produk.harga * jumlah;
  const pesan =
    `Halo, saya ingin memesan ${produk.nama}.\n` +
    `Jumlah: ${jumlah}\n` +
    `Harga satuan: ${formatRupiah(produk.harga)}\n` +
    `Total: ${formatRupiah(total)}`;
  const href = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  const tombolKelas =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-semibold hover:border-utama hover:text-utama disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="jumlah" className="text-sm font-semibold">
          Jumlah
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            className={tombolKelas}
            disabled={jumlah <= 1}
            onClick={() => atur(jumlah - 1)}
          >
            −
          </button>
          <input
            id="jumlah"
            type="number"
            inputMode="numeric"
            min={1}
            max={JUMLAH_MAKS}
            value={jumlah}
            onChange={(e) => atur(parseInt(e.target.value, 10) || 1)}
            className="h-11 w-16 rounded-lg border border-garis bg-latar text-center text-base text-teks focus:border-utama focus:outline-none"
          />
          <button
            type="button"
            aria-label="Tambah jumlah"
            className={tombolKelas}
            disabled={jumlah >= JUMLAH_MAKS}
            onClick={() => atur(jumlah + 1)}
          >
            +
          </button>
        </div>
        <p className="text-sm text-teks-lembut">Total: {formatRupiah(total)}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto sm:self-start"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
