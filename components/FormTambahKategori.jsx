"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahKategori } from "@/app/admin/actions";

export default function FormTambahKategori() {
  const [state, formAction, isPending] = useActionState(tambahKategori, null);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input label="Tambah kategori" name="nama" maxLength={40} required />
        </div>
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah"}
        </Tombol>
      </div>
      {state?.error && <p className="text-sm text-bahaya">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-utama">{state.success}</p>}
    </form>
  );
}
