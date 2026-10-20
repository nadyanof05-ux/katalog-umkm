"use client";

import { useActionState, useState } from "react";
import { buatDeskripsi } from "@/app/admin/actions";
import { periksaFile, FOTO_MAKS, UKURAN_UNGGAH_MAKS } from "@/lib/foto";
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

  const [pesanFile, setPesanFile] = useState("");

  // US-29: cek cepat di browser; server tetap memeriksa ulang.
  function periksaPilihanFile(e) {
    const files = [...e.target.files];
    const pesan =
      files.map(periksaFile).find(Boolean) ??
      (files.reduce((jumlah, f) => jumlah + f.size, 0) > UKURAN_UNGGAH_MAKS
        ? "Total ukuran foto terlalu besar. Maksimal 4 MB sekali simpan."
        : files.length > FOTO_MAKS
          ? `Foto maksimal ${FOTO_MAKS} per produk.`
          : "");
    setPesanFile(pesan ?? "");
    if (pesan) e.target.value = "";
  }

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
      <Input
        label="Harga diskon (Rp, kosongkan jika tidak diskon)"
        name="harga_diskon"
        type="number"
        min="0"
        defaultValue={produk.harga_diskon ?? ""}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Badge
        <select
          name="badge"
          defaultValue={produk.badge ?? ""}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
        >
          <option value="">Tanpa badge</option>
          <option value="Baru">Baru</option>
          <option value="Terlaris">Terlaris</option>
        </select>
      </label>
      <Input
        label="Stok (0 berarti habis)"
        name="stok"
        type="number"
        min="0"
        step="1"
        defaultValue={produk.stok ?? 1}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto (satu link per baris, maksimal 6; yang pertama jadi foto utama)"
        name="foto_url"
        textarea
        placeholder={"https://...\n/produk/nama-file.svg"}
        defaultValue={produk.foto_url}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Unggah foto dari komputer
        <input
          type="file"
          name="foto_file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={periksaPilihanFile}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal"
        />
        <span className="text-xs font-normal text-teks-lembut">
          JPG, PNG, atau WebP. Maksimal 2 MB per foto dan 4 MB total. Foto yang diunggah ditambahkan
          setelah link di atas.
        </span>
        {pesanFile && <span className="text-sm font-normal text-bahaya">{pesanFile}</span>}
      </label>
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
