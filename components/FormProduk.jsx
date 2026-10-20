"use client";

import { useActionState, useState } from "react";
import { buatDeskripsi } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
const tanpaAksi = async () => null;

export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [state, formAction, isPending] = useActionState(action ?? tanpaAksi, null);
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi ?? "");
  const [sedangBuat, setSedangBuat] = useState(false);
  const [pesanAi, setPesanAi] = useState("");

  // US-14: isi kolom deskripsi dengan hasil AI; admin masih bisa mengeditnya sebelum menyimpan.
  async function buatDenganAi(e) {
    const { nama, kategori } = e.currentTarget.form.elements;
    setSedangBuat(true);
    setPesanAi("");
    const hasil = await buatDeskripsi(nama.value, kategori.value);
    setSedangBuat(false);
    if (hasil?.deskripsi) {
      setDeskripsi(hasil.deskripsi);
    } else {
      setPesanAi(hasil?.error ?? "Gagal membuat deskripsi.");
    }
  }

  return (
    <form action={action ? formAction : undefined} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-bahaya">
          {state.error}
        </p>
      )}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        value={deskripsi}
        onChange={(e) => setDeskripsi(e.target.value)}
      />
      <div className="flex flex-col items-start gap-1.5">
        <Tombol type="button" varian="garis" onClick={buatDenganAi} disabled={sedangBuat}>
          {sedangBuat ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
        </Tombol>
        {pesanAi && <p className="text-sm text-bahaya">{pesanAi}</p>}
      </div>
      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
