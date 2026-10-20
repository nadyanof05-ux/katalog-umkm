"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Tombol from "@/components/Tombol";
import { ambilProdukKeranjang } from "@/app/keranjang/actions";
import { formatRupiah } from "@/lib/format";
import { fotoUtama } from "@/lib/foto";
import { hargaAkhir } from "@/lib/harga";
import {
  JUMLAH_MAKS,
  hapusDariKeranjang,
  ubahJumlahKeranjang,
  useKeranjang,
} from "@/lib/keranjang";
import { toko } from "@/lib/toko";

const tombolKelas =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-semibold hover:border-utama hover:text-utama disabled:opacity-40";

// US-21: isi keranjang, ubah jumlah, hapus item, dan pesan semuanya lewat satu pesan WhatsApp.
export default function IsiKeranjang() {
  const keranjang = useKeranjang();
  const [produkPerId, setProdukPerId] = useState({});
  const [status, setStatus] = useState("memuat");
  const kunciId = keranjang.map((item) => item.id).sort((a, b) => a - b).join(",");

  useEffect(() => {
    if (!kunciId) {
      setStatus("siap");
      return;
    }
    let batal = false;
    ambilProdukKeranjang(kunciId.split(",").map(Number)).then((hasil) => {
      if (batal) return;
      if (hasil.error) {
        setStatus("gagal");
        return;
      }
      setProdukPerId(Object.fromEntries(hasil.produk.map((p) => [p.id, p])));
      setStatus("siap");
    });
    return () => {
      batal = true;
    };
  }, [kunciId]);

  if (keranjang.length === 0 && status !== "memuat") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
          Keranjang masih kosong.
        </p>
        <Tombol href="/">Lihat katalog</Tombol>
      </div>
    );
  }

  if (status === "memuat") {
    return <p className="text-sm text-teks-lembut">Memuat keranjang...</p>;
  }

  if (status === "gagal") {
    return (
      <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-bahaya">
        Keranjang belum bisa dimuat. Coba muat ulang halaman.
      </p>
    );
  }

  const baris = keranjang.map((item) => {
    const produk = produkPerId[item.id];
    const tersedia = Boolean(produk) && produk.stok > 0;
    const harga = produk ? hargaAkhir(produk) : 0;
    return { ...item, produk, tersedia, harga, subtotal: tersedia ? harga * item.jumlah : 0 };
  });
  const dipesan = baris.filter((b) => b.tersedia);
  const total = dipesan.reduce((jumlah, b) => jumlah + b.subtotal, 0);

  const pesan =
    "Halo, saya ingin memesan:\n" +
    dipesan
      .map(
        (b, i) =>
          `${i + 1}. ${b.produk.nama} x${b.jumlah} @ ${formatRupiah(b.harga)} = ${formatRupiah(b.subtotal)}`,
      )
      .join("\n") +
    `\nTotal: ${formatRupiah(total)}`;
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const href = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {baris.map((b) => (
          <li
            key={b.id}
            className="flex flex-col gap-3 rounded-2xl border border-garis p-3 sm:flex-row sm:items-center"
          >
            {b.produk ? (
              <>
                <img
                  src={fotoUtama(b.produk.foto_url)}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link
                    href={`/produk/${b.id}`}
                    className="font-semibold hover:text-utama"
                  >
                    {b.produk.nama}
                  </Link>
                  <p className="text-sm text-teks-lembut">{formatRupiah(b.harga)} per item</p>
                  {!b.tersedia && (
                    <p className="text-sm font-semibold text-bahaya">
                      Stok habis, tidak ikut dipesan.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="flex-1 text-sm text-bahaya">
                Produk ini sudah tidak tersedia, tidak ikut dipesan.
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                className={tombolKelas}
                disabled={b.jumlah <= 1}
                onClick={() => ubahJumlahKeranjang(b.id, b.jumlah - 1)}
              >
                −
              </button>
              <span className="w-8 text-center font-semibold" aria-label="Jumlah">
                {b.jumlah}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                className={tombolKelas}
                disabled={b.jumlah >= JUMLAH_MAKS}
                onClick={() => ubahJumlahKeranjang(b.id, b.jumlah + 1)}
              >
                +
              </button>
            </div>
            <p className="w-28 font-bold sm:text-right">{b.tersedia ? formatRupiah(b.subtotal) : "-"}</p>
            <Tombol type="button" varian="bahaya" onClick={() => hapusDariKeranjang(b.id)}>
              Hapus
            </Tombol>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-extrabold">Total: {formatRupiah(total)}</p>
        {dipesan.length > 0 ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
          >
            Pesan semua via WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-latar px-5 py-3 font-semibold text-teks-lembut opacity-70"
          >
            Tidak ada produk yang bisa dipesan
          </button>
        )}
      </div>
    </div>
  );
}
