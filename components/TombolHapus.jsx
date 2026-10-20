"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

// US-10: meminta konfirmasi sebelum menghapus; login diperiksa di Server Action.
export default function TombolHapus({ id, nama }) {
  const [state, formAction, isPending] = useActionState(hapusProduk.bind(null, id), null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Hapus produk "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <Tombol type="submit" varian="bahaya" disabled={isPending}>
        {isPending ? "Menghapus..." : "Hapus"}
      </Tombol>
      {state?.error && <p className="text-xs text-bahaya">{state.error}</p>}
    </form>
  );
}
