"use client";

import { useActionState, useState } from "react";
import Tombol from "@/components/Tombol";
import { hapusKategori, ubahKategori } from "@/app/admin/actions";

// US-31: satu baris kategori dengan ubah nama dan hapus (dengan konfirmasi).
export default function BarisKategori({ kategori, jumlahProduk }) {
  const [mengubah, setMengubah] = useState(false);
  const [stateUbah, aksiUbah, sedangUbah] = useActionState(
    async (prev, formData) => {
      const hasil = await ubahKategori(kategori.id, prev, formData);
      if (hasil?.success) setMengubah(false);
      return hasil;
    },
    null,
  );
  const [stateHapus, aksiHapus, sedangHapus] = useActionState(hapusKategori.bind(null, kategori.id), null);
  const pesanError = stateUbah?.error ?? stateHapus?.error;

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-garis p-3">
      <div className="flex flex-wrap items-center gap-3">
        {mengubah ? (
          <form action={aksiUbah} className="flex flex-1 items-center gap-2">
            <input
              name="nama"
              defaultValue={kategori.nama}
              maxLength={40}
              required
              autoFocus
              aria-label={`Nama baru untuk kategori ${kategori.nama}`}
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks focus:border-utama focus:outline-none"
            />
            <Tombol type="submit" disabled={sedangUbah}>
              {sedangUbah ? "Menyimpan..." : "Simpan"}
            </Tombol>
            <Tombol type="button" varian="garis" onClick={() => setMengubah(false)}>
              Batal
            </Tombol>
          </form>
        ) : (
          <>
            <div className="flex-1">
              <p className="font-semibold">{kategori.nama}</p>
              <p className="text-sm text-teks-lembut">{jumlahProduk} produk</p>
            </div>
            <Tombol type="button" varian="garis" onClick={() => setMengubah(true)}>
              Ubah
            </Tombol>
            <form
              action={aksiHapus}
              onSubmit={(e) => {
                if (!window.confirm(`Hapus kategori "${kategori.nama}"?`)) e.preventDefault();
              }}
            >
              <Tombol type="submit" varian="bahaya" disabled={sedangHapus}>
                {sedangHapus ? "Menghapus..." : "Hapus"}
              </Tombol>
            </form>
          </>
        )}
      </div>
      {pesanError && <p className="text-sm text-bahaya">{pesanError}</p>}
    </li>
  );
}
