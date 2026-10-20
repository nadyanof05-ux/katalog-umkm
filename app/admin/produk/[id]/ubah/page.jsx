import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { buatKlienAdmin } from "@/lib/supabase/admin";

// US-09: ubah produk (dilindungi proxy.js dan diperiksa lagi di Server Action).
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const idProduk = Number(id);

  if (!Number.isInteger(idProduk) || idProduk <= 0) {
    notFound();
  }

  const supabase = await buatKlienAdmin();
  const { data: produk } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", idProduk)
    .maybeSingle();

  if (!produk) {
    notFound();
  }

  const { data: kategori } = await supabase.from("kategori").select("nama").order("nama");

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        daftarKategori={(kategori ?? []).map((k) => k.nama)}
        labelTombol="Simpan perubahan"
        action={ubahProduk.bind(null, produk.id)}
      />
    </div>
  );
}
