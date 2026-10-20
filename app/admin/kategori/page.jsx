import NavAdmin from "@/components/NavAdmin";
import FormTambahKategori from "@/components/FormTambahKategori";
import BarisKategori from "@/components/BarisKategori";
import { buatKlienAdmin } from "@/lib/supabase/admin";

// Selalu ambil data terbaru dari database.
export const dynamic = "force-dynamic";

// US-31: kelola kategori (dilindungi proxy.js dan diperiksa lagi di setiap Server Action).
export default async function HalamanKategori() {
  const supabase = await buatKlienAdmin();
  const [{ data: kategori, error }, { data: produk }] = await Promise.all([
    supabase.from("kategori").select("id, nama").order("nama"),
    supabase.from("produk").select("kategori"),
  ]);

  const jumlahPerKategori = {};
  for (const baris of produk ?? []) {
    if (baris.kategori) jumlahPerKategori[baris.kategori] = (jumlahPerKategori[baris.kategori] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kategori</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Daftar ini dipakai di form produk. Mengubah nama ikut memperbarui produknya. Kategori yang
          masih dipakai produk tidak bisa dihapus.
        </p>
      </div>
      <FormTambahKategori />
      {error ? (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-bahaya">
          Kategori belum bisa dimuat. Pastikan SQL migrasi kategori sudah dijalankan di Supabase.
        </p>
      ) : kategori.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
          Belum ada kategori.
        </p>
      ) : (
        <ul className="flex max-w-2xl flex-col gap-3">
          {kategori.map((k) => (
            <BarisKategori key={`${k.id}-${k.nama}`} kategori={k} jumlahProduk={jumlahPerKategori[k.nama] ?? 0} />
          ))}
        </ul>
      )}
    </div>
  );
}
