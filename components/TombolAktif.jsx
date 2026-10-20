"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";
import { aturAktifProduk } from "@/app/admin/actions";

// US-32: sembunyikan atau tampilkan produk di katalog publik. Login diperiksa di Server Action.
export default function TombolAktif({ id, aktif }) {
  const [state, formAction, isPending] = useActionState(aturAktifProduk.bind(null, id, !aktif), null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Tombol type="submit" varian="garis" disabled={isPending}>
        {isPending ? "Menyimpan..." : aktif ? "Nonaktifkan" : "Aktifkan"}
      </Tombol>
      {state?.error && <p className="text-xs text-bahaya">{state.error}</p>}
    </form>
  );
}
