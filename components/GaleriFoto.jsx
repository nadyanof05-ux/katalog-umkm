"use client";

import { useState } from "react";

// US-18: foto utama besar + gambar kecil untuk berganti foto.
// Produk dengan satu foto tampil tanpa gambar kecil.
export default function GaleriFoto({ foto, nama }) {
  const [aktif, setAktif] = useState(0);
  const indeks = Math.min(aktif, foto.length - 1);

  if (foto.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <img
        src={foto[indeks]}
        alt={foto.length > 1 ? `${nama} (foto ${indeks + 1} dari ${foto.length})` : nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      {foto.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {foto.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setAktif(i)}
              aria-label={`Tampilkan foto ${i + 1}`}
              aria-current={i === indeks ? "true" : undefined}
              className={`overflow-hidden rounded-lg border-2 ${
                i === indeks ? "border-utama" : "border-garis hover:border-utama"
              }`}
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
