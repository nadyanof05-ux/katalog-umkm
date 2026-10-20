"use client";

import { useState } from "react";
import Link from "next/link";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { hargaAkhir } from "@/lib/harga";
import { tambahKeKeranjang } from "@/lib/keranjang";

const JUMLAH_MAKS = 99;

// US-12: pengunjung memilih jumlah; jumlah dan total ikut tertulis di pesan WhatsApp.
export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [ditambahkan, setDitambahkan] = useState(false);

  if (!produk) return null;

  // US-19: produk habis tidak bisa dipesan.
  if (produk.stok <= 0) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-permukaan px-5 py-3 font-semibold text-teks-lembut opacity-70 sm:w-auto sm:self-start"
        >
          Stok habis
        </button>
        <p className="text-sm text-teks-lembut">Produk ini sedang tidak tersedia.</p>
      </div>
    );
  }

  const atur = (nilai) => setJumlah(Math.min(JUMLAH_MAKS, Math.max(1, nilai)));

  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const hargaSatuan = hargaAkhir(produk);
  const total = hargaSatuan * jumlah;
  const pesan =
    `Halo, saya ingin memesan ${produk.nama}.\n` +
    `Jumlah: ${jumlah}\n` +
    `Harga satuan: ${formatRupiah(hargaSatuan)}\n` +
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            tambahKeKeranjang(produk.id, jumlah);
            setDitambahkan(true);
          }}
          className="inline-flex w-full items-center justify-center rounded-lg border border-utama bg-latar px-5 py-3 font-semibold text-utama hover:bg-permukaan sm:w-auto"
        >
          Tambah ke keranjang
        </button>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
      </div>
      {ditambahkan && (
        <p role="status" className="text-sm font-medium text-utama">
          Ditambahkan ke keranjang.{" "}
          <Link href="/keranjang" className="underline underline-offset-4">
            Lihat keranjang
          </Link>
        </p>
      )}
    </div>
  );
}
