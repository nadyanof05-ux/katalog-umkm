import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";
import { buatKlienAdmin } from "@/lib/supabase/admin";

// US-08: tambah produk (dilindungi proxy.js dan diperiksa lagi di Server Action).
export default async function HalamanTambahProduk() {
  const supabase = await buatKlienAdmin();
  const { data } = await supabase.from("kategori").select("nama").order("nama");

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk
        labelTombol="Simpan produk"
        action={tambahProduk}
        daftarKategori={(data ?? []).map((k) => k.nama)}
      />
    </div>
  );
}
