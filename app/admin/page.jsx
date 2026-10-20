import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienAdmin } from "@/lib/supabase/admin";
import { buatKlienPublik } from "@/lib/supabase/publik";

// Selalu ambil data produk terbaru dari database.
export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];

  try {
    const supabase = await buatKlienAdmin();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      daftarProduk = data;
    } else {
      const klienPublik = buatKlienPublik();
      const res = await klienPublik
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
        .order("created_at", { ascending: false });
      daftarProduk = res.data ?? [];
    }
  } catch (err) {
    console.error("Gagal mengambil daftar produk di halaman admin:", err);
    try {
      const klienPublik = buatKlienPublik();
      const res = await klienPublik
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
        .order("created_at", { ascending: false });
      daftarProduk = res.data ?? [];
    } catch {
      daftarProduk = [];
    }
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}
