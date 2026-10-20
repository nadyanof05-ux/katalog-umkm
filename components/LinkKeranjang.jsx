"use client";

import Link from "next/link";
import { useKeranjang } from "@/lib/keranjang";

// Tautan ke keranjang di header, dengan jumlah barang.
export default function LinkKeranjang() {
  const daftar = useKeranjang();
  const total = daftar.reduce((jumlah, item) => jumlah + item.jumlah, 0);

  return (
    <Link
      href="/keranjang"
      className="inline-flex items-center gap-2 rounded-lg border border-garis px-3 py-1.5 text-sm font-semibold hover:border-utama hover:text-utama"
    >
      Keranjang
      {total > 0 && (
        <span
          className="rounded-full bg-utama px-2 py-0.5 text-xs font-bold text-white"
          aria-label={`${total} barang`}
        >
          {total}
        </span>
      )}
    </Link>
  );
}
